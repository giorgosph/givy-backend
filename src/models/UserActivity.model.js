const db = require("../db/db");
const U_ACTIV = require("../utils/constants/tables").U_ACTIV;

module.exports = class UserActivity {
  constructor(data) {
    this.username = data.username;
    this.type = data.type;
    this.lastActivityDate = data.last_activity_date;
  }

  static async getAll() {
    const allUsers = await db.query(`SELECT * FROM ${U_ACTIV};`);
    let user = allUsers.rows.map((user) => new UserActivity(user));
    return user;
  }

  /* ----------------- Find User ----------------- */
  /* --------------------------------------------- */


  static async findUserWithType(data) {
    try {
      const user = await db.query(`SELECT * FROM ${U_ACTIV} WHERE username=$1 AND type=$2;`, 
        [data.username, data.type]
      );

      if (user.rows.length) return new UserActivity(user.rows[0]);
      else return false;
    }catch (err) {
      throw new Error("Query Error Finding UserActivity:\n", err);
    }
  };

  /* ----------------- Insert/Update Activity ----------------- */
  /* ---------------------------------------------------------- */

  static async insertActivity(data) {
    try {
      const user = await db.query(
        `INSERT INTO ${U_ACTIV} (username, type) VALUES ($1, $2);`, [data.username, data.type]
      );

      return new UserActivity(user.rows[0]);
    } catch (err) {
      throw new Error("Query Error Adding Register Activity:\n", err);
    }
  };

  static async updateActivity(data) {
    try {
      const user = await db.query(
        `UPDATE ${U_ACTIV} SET last_activity_date=$1 where username=$2 AND type=$3;`, 
        [NOW(), data.username, data.type]
      );

      return new UserActivity(user.rows[0]);
    } catch (err) {
      throw new Error("Query Error Adding Register Activity:\n", err);
    }
  };
};