import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
interface DrawItemTableData {
  id: number;
  draw_id: number;
  title: string;
  description: string;
  image_path: string;
  brief: string;
  price: number;
  winner: string;
}

interface DataProps {
  id: number;
  drawId: number;
  username: string;
}

/* ----------------- */

export default class DrawItem {
  id: number;
  drawId: number;
  title: string;
  description: string;
  imagePath: string;
  brief: string;
  price: number;
  winner: string;

  constructor(data: DrawItemTableData) {
    this.id = data.id;
    this.drawId = data.draw_id;
    this.title = data.title;
    this.description = data.description;
    this.imagePath = data.image_path;
    this.brief = data.brief;
    this.price = data.price;
    this.winner = data.winner;
  }

  static async getAll(client: PoolClient) {
    const allItems = await client.query(`SELECT * FROM ${Tables.D_ITEM};`);
    return allItems.rows.map((item: any) => new DrawItem(item));
  }

  static async findByDrawID(drawId: number, client: PoolClient) {
    const allItems = await client.query(
      `SELECT * FROM ${Tables.D_ITEM} WHERE draw_id=$1 ORDER BY price DESC;`,
      [drawId]
    );
    return allItems.rows.map((item: any) => new DrawItem(item));
  }

  static async findByDrawIDSortByPrice(drawId: number, client: PoolClient) {
    const allItems = await client.query(
      `SELECT * FROM ${Tables.D_ITEM} WHERE draw_id=$1 ORDER BY price ASC;`,
      [drawId]
    );
    return allItems.rows.map((item: any) => new DrawItem(item));
  }

  static async findByWinner(username: string, client: PoolClient) {
    const allItems = await client.query(
      `SELECT * FROM ${Tables.D_ITEM} WHERE winner=$1;`,
      [username]
    );
    return allItems.rows.map((item: any) => new DrawItem(item));
  }

  static async setWinner(data: DataProps, client: PoolClient) {
    await client.query(
      `UPDATE ${Tables.D_ITEM} SET winner=$1 WHERE draw_id=$2 AND id=$3;`,
      [data.username, data.drawId, data.id]
    );
  }
}
