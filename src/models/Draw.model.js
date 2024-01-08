const DRAW = require("../utils/constants/tables").DRAW;

module.exports = class Draw {
  constructor(data) {
    this.id = data.id;
    this.plan = data.plan;
    this.title = data.title;
    this.brief = data.brief;
    this.country = data.country;
    this.location = data.location;
    this.category = data.category;
    this.imagePath = data.image_path;
    this.openingDate = data.opening_date;
    this.creationDate = data.creation_date;
    this.closingDate = data.closing_date;
  }

  static async getAll(client) {
    const allDraws = await client.query(`SELECT * FROM ${DRAW};`);

    const draws = allDraws.rows.map((draw) => new Draw(draw));
    return draws;
  }

  static async getUpcomingDraws(client) {
    const allDraws = await client.query(`SELECT * FROM ${DRAW} WHERE closing_date > CURRENT_TIMESTAMP;`);

    const draws = allDraws.rows.map((draw) => new Draw(draw));
    return draws;
  }

  static async getUpcomingDrawsUnder4Hours(client) {
    const allDraws = await client.query(`SELECT * FROM ${DRAW} WHERE closing_date <= CURRENT_TIMESTAMP + interval '4 hours' AND closing_date > CURRENT_TIMESTAMP;`);

    const draws = allDraws.rows.map((draw) => new Draw(draw));
    return draws;
  }
};