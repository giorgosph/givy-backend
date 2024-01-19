const FEEDBACK = require("../utils/constants/tables").FEEDBACK;

module.exports = class UserFeedback {
  constructor(data) {
    this.username = data.username;
    this.rating = data.rating;
    this.comments = data.comments;
  }

  /* ----------------- Insert/Update ----------------- */
  /* ------------------------------------------------- */

  static async upsert(data, client) {      
    await client.query(
      `INSERT INTO ${FEEDBACK} (username, rating, comments) VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO UPDATE SET rating=$2, comments=$3;`, 
      [data.username, data.rating, data.comments]
    );
  };
  
};