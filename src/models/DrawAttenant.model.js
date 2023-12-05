const D_ATTENANT = require("../utils/constants/tables").D_ATTENANT;

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
    const allUsers = await client.query(`SELECT * FROM ${D_ATTENANT} WHERE draw_id = $1;`, [drawId]);

    if(allUsers.rows.length > 0) {
      const users = allUsers.rows.map((user) => new DrawAttenant(user));
      return users;
    } else return false;
  }

  static async findByUsername(username, client) {
    // if app/data scales in future add -> where closing_date is > today from draw table
    const allDraws = await client.query(`SELECT draw_id FROM ${D_ATTENANT} WHERE username = $1;`, [username]);

    if(allDraws.rows.length > 0) {
      const draws = allDraws.rows.map((draw) => new DrawAttenant(draw));
      return draws;
    } else return false;
  }

  /* ----------------- Register ----------------- */
  /* -------------------------------------------- */
  
  static async register(data, client) {
    const draw = await client.query(
      `INSERT INTO ${D_ATTENANT} (draw_id, username) VALUES ($1, $2) RETURNING *;`,
      [data.drawId, data.username]
    );

    if (draw.rows.length) return new DrawAttenant(draw.rows[0]);
    else return false;
  }

};