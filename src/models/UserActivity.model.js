const U_ACTIV = require("../utils/constants/tables").U_ACTIV;

module.exports = class UserActivity {
  constructor(data) {
    this.username = data.username;
    this.type = data.type;
    this.lastActivityDate = data.last_activity_date;
  }

  static async getAll(client) {
    const allUsers = await client.query(`SELECT * FROM ${U_ACTIV};`);

    let user = allUsers.rows.map((user) => new UserActivity(user));
    return user;
  }

  /* ----------------- Find User ----------------- */
  /* --------------------------------------------- */


  static async findUserWithType(data, client) {  
    const user = await client.query(`SELECT * FROM ${U_ACTIV} WHERE username=$1 AND type=$2;`, [data.username, data.type]);

    if (user.rows.length) return new UserActivity(user.rows[0]);
    else return false;
  };

  /* ----------------- Insert/Update Activity ----------------- */
  /* ---------------------------------------------------------- */

  static async insert(data, client) {  
    await client.query(
      `INSERT INTO ${U_ACTIV} (username, type) VALUES ($1, $2) RETURNING *;`, [data.username, data.type]
    );
  };

  static async update(data, client) {  
    const date = new Date();

    await client.query(
      `UPDATE ${U_ACTIV} SET last_activity_date=$1 where username=$2 AND type=$3;`, 
      [date, data.username, data.type]
    );
  };

  static async upsert(data, client) {  
    const date = new Date();
    
    await client.query(
      `INSERT INTO ${U_ACTIV} (username, type, last_activity_date) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username, type) DO UPDATE SET last_activity_date = $3;`, 
      [data.username, data.type, date]
    );
  };
  
};