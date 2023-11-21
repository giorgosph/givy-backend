const CONFIRM = require("../utils/constants/tables").CONFIRM;

module.exports = class Confirmation {
  constructor(data) {
    this.username = data.username;
    this.type = data.type;
    this.sendedDate = data.sended_date
    this.notes = data.notes
    this.code = data.code
  }

  static async getAll(client) {
    const allUsers = await client.query(`SELECT * FROM ${CONFIRM};`);

    let user = allUsers.rows.map((user) => new Confirmation(user));
    return user;
  }

  /* ----------------- Find User ----------------- */
  /* --------------------------------------------- */


  static async findUserWithType(data, client) {  
    const user = await client.query(`SELECT * FROM ${CONFIRM} WHERE username=$1 AND type=$2;`, [data.username, data.type]);

    if (user.rows.length) return new Confirmation(user.rows[0]);
    else return false;
  };

  /* ----------------- Insert/Update/Delete Confiramtion ----------------- */
  /* ---------------------------------------------------------------------- */

  static async insert(data, client) {  
    await client.query(
      `INSERT INTO ${CONFIRM} (username, type, notes, code) VALUES ($1, $2, $3, $4) RETURNING *;`, 
      [data.username, data.type, data?.notes || null, data.code]
    );
  };

  static async update(data, client) {  
    const date = new Date();
    await client.query(
      `UPDATE ${CONFIRM} SET last_activity_date=$1 where username=$2 AND type=$3 RETURNING *;`, 
      [date, data.username, data.type]
    );
  };
};