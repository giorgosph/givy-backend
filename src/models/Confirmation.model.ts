import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
export type ConfirmationType = "email" | "mobile" | "forgot_password";

interface ConfirmationTableData {
  username: string;
  type: ConfirmationType;
  sended_date: Date;
  notes: string;
  code: number;
}

interface DataProps {
  username: string;
  type: ConfirmationType;
  notes?: string;
  code: number;
}

interface DataShortProps {
  username: string;
  type: ConfirmationType;
}

/* ----------------- */

export default class Confirmation {
  username: string;
  type: string;
  sendedDate: Date;
  notes: string;
  code: number;

  constructor(data: ConfirmationTableData) {
    this.username = data.username;
    this.type = data.type;
    this.sendedDate = data.sended_date;
    this.notes = data.notes;
    this.code = data.code;
  }

  static async getAll(client: PoolClient) {
    const allUsers = await client.query(`SELECT * FROM ${Tables.CONFIRM};`);
    return allUsers.rows.map((user: any) => new Confirmation(user));
  }

  static async findUserWithType(data: DataShortProps, client: PoolClient) {
    const user = await client.query(
      `SELECT * FROM ${Tables.CONFIRM} WHERE username=$1 AND type=$2;`,
      [data.username, data.type]
    );
    return user.rows.length ? new Confirmation(user.rows[0]) : false;
  }

  static async insert(data: DataProps, client: PoolClient) {
    await client.query(
      `INSERT INTO ${Tables.CONFIRM} (username, type, notes, code) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [data.username, data.type, data.notes, data.code]
    );
  }

  static async upsert(data: DataProps, client: PoolClient) {
    const date = new Date();
    await client.query(
      `
      INSERT INTO ${Tables.CONFIRM} (username, type, notes, code, sended_date) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username, type) DO UPDATE SET notes=$3, code=$4, sended_date=$5;`,
      [data.username, data.type, data.notes, data.code, date]
    );
  }

  static async update(data: DataProps, client: PoolClient) {
    const date = new Date();
    await client.query(
      `UPDATE ${Tables.CONFIRM} SET sended_date=$1, code=$2, notes=$3 WHERE username=$4 AND type=$5;`,
      [date, data.code, data.notes, data.username, data.type]
    );
  }

  static async delete(data: DataShortProps, client: PoolClient) {
    await client.query(
      `DELETE FROM ${Tables.CONFIRM} WHERE username=$1 AND type=$2`,
      [data.username, data.type]
    );
  }
}
