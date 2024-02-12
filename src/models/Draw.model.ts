import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
export type PlansType = "basic" | "premium" | "platinum";
export type DrawCategoriesType =
  | "general"
  | "electronics"
  | "home"
  | "clothing"
  | "personal_care"
  | "vacation"
  | "learning"
  | "gaming"
  | "stationery"
  | "hospitality";

interface DrawData {
  id: number;
  plan: PlansType;
  title: string;
  brief: string;
  country: string;
  location: string;
  category: DrawCategoriesType;
  image_path: string;
  opening_date: Date;
  creation_date: Date;
  closing_date: Date;
}

/* ----------------- */

export default class Draw {
  id: number;
  plan: PlansType;
  title: string;
  brief: string;
  country: string;
  location: string;
  category: DrawCategoriesType;
  imagePath: string;
  openingDate: Date;
  creationDate: Date;
  closingDate: Date;

  constructor(data: DrawData) {
    this.id = data.id;
    this.plan = data.plan;
    this.title = data.title;
    this.brief = data.brief;
    this.country = data.country;
    this.location = data.location;
    this.category = data.category;
    this.imagePath = data.image_path;
    this.openingDate = data.opening_date;
    this.creationDate = data.creation_date;
    this.closingDate = data.closing_date;
  }

  static async getAll(client: PoolClient) {
    const allDraws = await client.query(`SELECT * FROM ${Tables.DRAW};`);
    return allDraws.rows.map((draw: any) => new Draw(draw));
  }

  static async getUpcomingDraws(client: PoolClient) {
    const allDraws = await client.query(
      `SELECT * FROM ${Tables.DRAW} WHERE closing_date > CURRENT_TIMESTAMP;`
    );
    return allDraws.rows.map((draw: any) => new Draw(draw));
  }

  static async getUpcomingDrawsUnder4Hours(client: PoolClient) {
    const allDraws = await client.query(
      `SELECT * FROM ${Tables.DRAW} WHERE closing_date <= CURRENT_TIMESTAMP + interval '4 hours' AND closing_date > CURRENT_TIMESTAMP;`
    );
    return allDraws.rows.map((draw: any) => new Draw(draw));
  }
}
