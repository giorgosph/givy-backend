const D_ATTENANT = require("../utils/constants/tables").D_ATTENANT;
const DRAW = require("../utils/constants/tables").DRAW;

module.exports = class DrawAttenant {
  constructor(data) {
    this.drawId = data.draw_id;
    this.username = data.username;
  }

  static async getAll(client) {
    const allUsers = await client.query(`SELECT * FROM ${D_ATTENANT};`);

    const users = allUsers.rows.map((user) => new DrawAttenant(user));
    return users;
  }

  /* ----------------- Finders ----------------- */
  /* ------------------------------------------- */

  static async findByDraw(drawId, client) {
    const allUsers = await client.query(`SELECT username FROM ${D_ATTENANT} WHERE draw_id = $1;`, [drawId]);

    const users = allUsers.rows.map((user) => new DrawAttenant(user));
    return users;
  }

  static async findUpcomingByUsername(username, client) {
    const allDraws = await client.query(
      `SELECT da.draw_id FROM ${D_ATTENANT} AS da INNER JOIN ${DRAW} AS d ON da.draw_id = d.id
      WHERE d.closing_date > CURRENT_TIMESTAMP AND da.username = $1;`, 
      [username]
    );
  
    const draws = allDraws.rows.map((draw) => new DrawAttenant(draw));
    return draws;
  }

  /* ----------------- Register ----------------- */
  /* -------------------------------------------- */
  
  static async register(data, client) {
    const draw = await client.query(
      `INSERT INTO ${D_ATTENANT} (draw_id, username) VALUES ($1, $2) RETURNING *;`,
      [data.drawId, data.username]
    );

    if (draw.rows.length > 0) return new DrawAttenant(draw.rows[0]);
    else return false;
  }

};