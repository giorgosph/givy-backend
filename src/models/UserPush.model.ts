import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
interface PushTableData {
  username: string;
  push_token: string;
  creation_date: Date;
}

interface DataProps {
  username: string;
  pushToken: string;
}

/* ----------------- */

export default class UserPush {
  username: string;
  pushToken: string;
  creationDate: Date;

  constructor(data: PushTableData) {
    this.username = data.username;
    this.pushToken = data.push_token;
    this.creationDate = data.creation_date;
  }

  static async getAllTokens(client: PoolClient) {
    const tokens = await client.query(
      `SELECT push_token FROM ${Tables.U_PUSH};`
    );
    return tokens.rows.map((token: PushTableData) => new UserPush(token));
  }

  static async getUserTokens(username: string, client: PoolClient) {
    const tokens = await client.query(
      `SELECT push_token FROM ${Tables.U_PUSH} WHERE username=$1;`,
      [username]
    );
    return tokens.rows.map((token: PushTableData) => new UserPush(token));
  }

  static async insert(data: DataProps, client: PoolClient) {
    await client.query(
      `INSERT INTO ${Tables.U_PUSH} (username, push_token) VALUES ($1, $2);`,
      [data.username, data.pushToken]
    );
  }

  static async delete(data: DataProps, client: PoolClient) {
    await client.query(
      `DELETE FROM ${Tables.U_PUSH} WHERE username=$1 AND push_token=$2`,
      [data.username, data.pushToken]
    );
  }
}
