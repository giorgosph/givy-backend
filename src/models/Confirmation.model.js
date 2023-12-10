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
      [data.username, data.type, data?.notes, data.code]
    );
  };

  static async update(data, client) {  
    const date = new Date();
    await client.query(
      `UPDATE ${CONFIRM} SET sended_date=$1, code=$2, notes=$3 WHERE username=$4 AND type=$5;`,
      [date, data.code, data?.notes, data.username, data.type]
    );    
  };

  static async delete(data, client) { 
    await client.query(`DELETE FROM ${CONFIRM} WHERE username=$1 AND type=$2`, [data.username, data.type]);
  };
  
};