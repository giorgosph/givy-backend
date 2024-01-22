const User = require("../models").User;
const Draw = require("../models").Draw;
const DrawItem = require("../models").DrawItem;
const DrawAttenant = require("../models").DrawAttenant;
const Confirmation = require("../models").Confirmation;

const ws = require("../webSocket");
const transaction = require("../db/db").transaction;

const log = require("../utils/logger/logger");
const emailer = require("../utils/helperFunctions/email");

/* -------------------------------------------------------------------- */

const checkUpcomingDraws = async () => {
  log.info("Checking for Upcoming Draws (Scheduler) ...");
  const client = await transaction.start();

  try {
    const draws = await Draw.getUpcomingDrawsUnder4Hours(client)
    await transaction.end(client);
    if(!draws) return log.debug("No Upcoming Draws");

    draws.forEach((draw) => {
      const currentTime = new Date().getTime();
      const closingTime = new Date(draw.closingDate).getTime(); 

      const timeDifference = closingTime - currentTime;

      if(timeDifference <= 4 * 60 * 60 * 1000 && timeDifference > 0) {
        setTimeout(async () => {
          const client2 = await transaction.start();
          log.info(`Calculating winners for draw: ${draw.id}`);

          try {
            // Get all Items for the draw
            const items = await DrawItem.findByDrawIDSortByPrice(draw.id, client2);
            if(!items || items.length == 0) throw new Error(`No items found for draw with id: ${draw.id}`);

            // Get all attenants for the draw
            const attenants = await DrawAttenant.findByDraw(draw.id, client2);
            if(!attenants || attenants.length == 0) throw new Error(`No attenants found for draw with id: ${draw.id}`);
            
            const winners = [];

            for(const item of items) {
              // Calculate random winner
              const randomIndex = Math.floor(Math.random() * (attenants.length-1));
              const winner = attenants[randomIndex].username;

              // Set winner to drawItem table
              await DrawItem.setWinner({username: winner, drawId: draw.id, id: item.id}, client2);
              log.info(`Winner for item: ${item.id} -> ${winner}`);
              winners[item.id] = winner;

              // Send email and sms to the user
              // TODO -> implement emailer.sendWinner function
              const { email, mobile } = await User.findByUsername(winner, client2);
              const isMobileConfirmed = mobile ? !await Confirmation.findUserWithType({username: winner, type: 'mobile'}, client2) : false;

              if(isMobileConfirmed) 0; // Send sms
              emailer.send();
            };

            // Send information to client through WebSocket
            const message = `Winners:\n ${winners}`;
            const body = {
              drawId: draw.id,
              winners
            };

            ws.send({ body, message, type: 'runningDraws'});

            await transaction.commit(client2);
            log.info('Winners calculated successfully');
          } catch (err) {
            await transaction.rollback(client2);
            log.error(`Error calculating winners for draw with id: ${draw.id}:\n ${err}`);
          }
        }, timeDifference);
      }
    });
  } catch (err) {
    await transaction.rollback(client);
    log.error(`Error while checking upcoming draws:\n ${err}`);
  }
};

module.exports = {
  checkUpcomingDraws,
};