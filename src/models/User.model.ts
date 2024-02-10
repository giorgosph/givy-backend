import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";
import { PlansType } from "./Draw.model";

/* ----- Types ----- */
export type GenderType = "male" | "female" | "other";

interface UserTableData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  paid_plan: PlansType;
  mobile: number;
  mobile_ext: number;
  creationDate: Date;
  is_confirmed: boolean;
  gender: GenderType;
  country: string;
  city: string;
  address1: string;
  address2: string;
  postal_code: string;
  role: string;
  last_feedback_date: Date;
}

interface RegisterDataProp {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: number;
  mobileExt?: number;
  gender: GenderType;
  country?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
}

interface AddressDataProp {
  username: string;
  country?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
}

/* ----------------- */

export default class User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  paidPlan: PlansType;
  mobile: number;
  mobileExt: number;
  creationDate: Date;
  isConfirmed: boolean;
  gender: GenderType;
  country: string;
  city: string;
  address1: string;
  address2: string;
  postalCode: string;
  role: string;
  lastFeedbackDate: Date;

  constructor(data: UserTableData) {
    this.username = data.username;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.password = data.password;
    this.paidPlan = data.paid_plan;
    this.mobile = data.mobile;
    this.mobileExt = data.mobile_ext;
    this.creationDate = data.creationDate;
    this.isConfirmed = data.is_confirmed;
    this.gender = data.gender;
    this.country = data.country;
    this.city = data.city;
    this.address1 = data.address1;
    this.address2 = data.address2;
    this.postalCode = data.postal_code;
    this.role = data.role;
    this.lastFeedbackDate = data.last_feedback_date;
  }

  static async getAll(client: PoolClient) {
    const allUsers = await client.query(`SELECT * FROM ${Tables.USERS};`);
    return allUsers.rows.map((user: any) => new User(user));
  }

  static async findUser(
    data: { username: string; email: string; mobile?: string },
    client: PoolClient
  ) {
    let user = await this.findByUsername(data.username, client);
    if (user) return { exist: true, type: "username" };

    user = await this.findByEmail(data.email, client);
    if (user) return { exist: true, type: "email" };

    // TODO: Mobile check
    // user = await this.findByMobile(data.mobile, client);
    // if (user) return { exist: true, type: 'mobile' };

    return false;
  }

  static async findByEmail(email: string, client: PoolClient) {
    const user = await client.query(
      `SELECT * FROM ${Tables.USERS} WHERE email = $1;`,
      [email]
    );
    return new User(user.rows[0]);
  }

  static async findByUsername(username: string, client: PoolClient) {
    const user = await client.query(
      `SELECT * FROM ${Tables.USERS} WHERE username = $1;`,
      [username]
    );
    return new User(user.rows[0]);
  }

  static async findByMobile(mobile: number, client: PoolClient) {
    const user = await client.query(
      `SELECT * FROM ${Tables.USERS} WHERE mobile = $1;`,
      [mobile]
    );
    return user.rows.length ? new User(user.rows[0]) : false;
  }

  static async register(data: RegisterDataProp, client: PoolClient) {
    const user = await client.query(
      `INSERT INTO ${Tables.USERS} (username, first_name, last_name, email, password, mobile, mobile_ext, gender, country, city, address_line_1, address_line_2, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`,
      [
        data.username,
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.mobile,
        data?.mobileExt || "0044",
        data.gender,
        data.country,
        data.city,
        data.address1,
        data.address2,
        data.postalCode,
      ]
    );

    return new User(user.rows[0]);
  }

  static async updateEmail(
    data: { email: string; username: string },
    client: PoolClient
  ) {
    const email = await client.query(
      `UPDATE ${Tables.USERS} SET email=$1 WHERE username=$2 RETURNING email`,
      [data.email, data.username]
    );
    return email.rows[0].email;
  }

  static async updateMobile(
    data: { mobile: number; username: string },
    client: PoolClient
  ) {
    const mobile = await client.query(
      `UPDATE ${Tables.USERS} SET mobile=$1 WHERE username=$2 RETURNING mobile;`,
      [data.mobile, data.username]
    );
    return mobile.rows[0].mobile;
  }

  static async updateAddress(data: AddressDataProp, client: PoolClient) {
    const user = await client.query(
      `UPDATE ${Tables.USERS} SET country=$1, city=$2, address_line_1=$3, address_line_2=$4, postal_code=$5 WHERE username=$6 RETURNING *;`,
      [
        data?.country,
        data?.city,
        data?.address1,
        data?.address2,
        data?.postalCode,
        data.username,
      ]
    );

    return user.rows.length ? new User(user.rows[0]) : false;
  }

  static async updatePassword(
    data: { password: string; username: string },
    client: PoolClient
  ) {
    await client.query(
      `UPDATE ${Tables.USERS} SET password=$1 WHERE username=$2`,
      [data.password, data.username]
    );
  }

  static async updateFeedbackDate(username: string, client: PoolClient) {
    await client.query(
      `UPDATE ${Tables.USERS} SET last_feedback_date=CURRENT_TIMESTAMP WHERE username=$1`,
      [username]
    );
  }
}
