import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
interface DrawAttenantData {
  draw_id: number;
  username: string;
}

interface DataProps {
  drawId: number;
  username: string;
}

/* ----------------- */

export default class DrawAttenant {
  drawId: number;
  username: string;

  constructor(data: DrawAttenantData) {
    this.drawId = data.draw_id;
    this.username = data.username;
  }

  static async getAll(client: PoolClient) {
    const allUsers = await client.query(`SELECT * FROM ${Tables.D_ATTENANT};`);
    return allUsers.rows.map((user: any) => new DrawAttenant(user));
  }

  static async findByDraw(drawId: number, client: PoolClient) {
    const allUsers = await client.query(
      `SELECT username FROM ${Tables.D_ATTENANT} WHERE draw_id = $1;`,
      [drawId]
    );
    return allUsers.rows.map((user: any) => new DrawAttenant(user));
  }

  static async findUpcomingByUsername(username: string, client: PoolClient) {
    const allDraws = await client.query(
      `SELECT da.draw_id FROM ${Tables.D_ATTENANT} AS da INNER JOIN ${Tables.DRAW} AS d ON da.draw_id = d.id
      WHERE d.closing_date > CURRENT_TIMESTAMP AND da.username = $1;`,
      [username]
    );

    return allDraws.rows.map((draw: any) => new DrawAttenant(draw));
  }

  static async register(data: DataProps, client: PoolClient) {
    const draw = await client.query(
      `INSERT INTO ${Tables.D_ATTENANT} (draw_id, username) VALUES ($1, $2) RETURNING *;`,
      [data.drawId, data.username]
    );

    return new DrawAttenant(draw.rows[0]);
  }
}
