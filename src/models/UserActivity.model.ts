import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
type UAType =
  | "register"
  | "login"
  | "open_app"
  | "email_confirmation"
  | "mobile_confirmation"
  | "reset_password"
  | "update_details";

interface UserActivityTableData {
  username: string;
  type: UAType;
  last_activity_date: Date;
}

interface DataProps {
  username: string;
  type: UAType;
}

/* ----------------- */

export default class UserActivity {
  username: string;
  type: UAType;
  lastActivityDate: Date;

  constructor(data: UserActivityTableData) {
    this.username = data.username;
    this.type = data.type;
    this.lastActivityDate = data.last_activity_date;
  }

  static async getAll(client: PoolClient) {
    const allUsers = await client.query(`SELECT * FROM ${Tables.U_ACTIV};`);
    return allUsers.rows.map((user: any) => new UserActivity(user));
  }

  static async findUserWithType(data: DataProps, client: PoolClient) {
    const user = await client.query(
      `SELECT * FROM ${Tables.U_ACTIV} WHERE username=$1 AND type=$2;`,
      [data.username, data.type]
    );
    return user.rows.length ? new UserActivity(user.rows[0]) : false;
  }

  static async insert(data: DataProps, client: PoolClient) {
    await client.query(
      `INSERT INTO ${Tables.U_ACTIV} (username, type) VALUES ($1, $2) RETURNING *;`,
      [data.username, data.type]
    );
  }

  static async update(data: DataProps, client: PoolClient) {
    const date = new Date();
    await client.query(
      `UPDATE ${Tables.U_ACTIV} SET last_activity_date=$1 where username=$2 AND type=$3;`,
      [date, data.username, data.type]
    );
  }

  static async upsert(data: DataProps, client: PoolClient) {
    const date = new Date();
    await client.query(
      `INSERT INTO ${Tables.U_ACTIV} (username, type, last_activity_date) VALUES ($1, $2, $3) ON CONFLICT (username, type) DO UPDATE SET last_activity_date=$3;`,
      [data.username, data.type, date]
    );
  }
}
