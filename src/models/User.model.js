const USERS = require("../utils/constants/tables").USERS;

module.exports = class User {
  constructor(data) {
    // ?? add validateUser funciton to check for invalid input
    this.username = data.username;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.password = data.password;
    this.paidPlan = data.paid_plan;
    this.mobile = data.mobile;
    this.mobileExt = data.mobile_ext; 
    this.creationDate = data.creation_date; 
    this.isConfirmed = data.is_confirmed;
    this.gender = data.gender;
    this.country = data.country;
    this.city = data.city;
    this.address1 = data.address_line_1;
    this.address2 = data.address_line_2;
    this.postalCode = data.postal_code;
  }

  static async getAll(client) {
    const allUsers = await client.query(`SELECT * FROM ${USERS};`);

    const users = allUsers.rows.map((user) => new User(user));
    return users;
  }

  /* ----------------- Find User ----------------- */

  static async findUser(data, client) {
    let user = await this.findByUsername(data.username, client);
    if (user) return {exist: true, type: 'username'};

    user = await this.findByEmail(data.email, client);
    if (user) return {exist: true, type: 'email'};

    // user = await this.findByMobile(data.mobile, client);
    // if (user) return {exist: true, type: 'mobile'};

    return false;
  }

  static async findByEmail(email, client) {
    const user = await client.query(`SELECT * FROM ${USERS} WHERE email = $1;`, [email]);

    if (user.rows.length) return new User(user.rows[0]);
    else return false;
  }

  static async findByUsername(username, client) {
    const user = await client.query(`SELECT * FROM ${USERS} WHERE username = $1;`, [username]);

    if (user.rows.length) return new User(user.rows[0]);
    else return false;
  }

  static async findByMobile(mobile, client) {
    const user = await client.query(`SELECT * FROM ${USERS} WHERE mobile = $1;`, [mobile]);

    if (user.rows.length) return new User(user.rows[0]);
    else return false;
  }

  /* ----------------- Auth User ----------------- */
  
  static async register(data, client) {
    const user = await client.query(
      `INSERT INTO ${USERS} \
      (username, first_name, last_name, email, password, mobile, mobile_ext, gender, country, city, address_line_1, address_line_2, postal_code) \
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`,
      [
        data.username,
        data.fullName,
        data?.lastName || null,
        data.email,
        data.password,
        data?.mobile || null,
        data?.mobileExt || '00357',
        data?.gender || null,
        data?.country || null,
        data?.city || null, 
        data?.address1 || null,
        data?.address2 || null,
        data?.postalCode || null,
      ]
    );

    if (user.rows.length) return new User(user.rows[0]);
    else return false;
  }

  static async setConfirmationCode(userInfo, code = null, client) {
    const result = await client.query(
      `UPDATE ${USERS} SET code=$2 WHERE username=$1 or email=$1 RETURNING *;`,
      [userInfo, code]
    );

    return result.rowCount;
  }

  static async updatePassword(userInfo, password, client) {
    const res = await client.query(
      `UPDATE ${USERS} SET password=$1 WHERE username=$2 or email=$2 RETURNING username`,
      [password, userInfo]
    );

    return res.rowCount;
  };
};