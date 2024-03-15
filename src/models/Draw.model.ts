import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";
import { NewDraw } from "../utils/types/objectTypes";

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
  total_price?: number;
  draw_images?: string[];
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
  totalPrice?: number;
  drawImages?: string[];

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
    this.totalPrice = data?.total_price || undefined;
    this.drawImages = data?.draw_images || undefined;
  }

  static async getAll(client: PoolClient) {
    const allDraws = await client.query(`SELECT * FROM ${Tables.DRAW};`);
    return allDraws.rows.map((draw: DrawData) => new Draw(draw));
  }

  static async getBestDraw(client: PoolClient) {
    const draw = await client.query(
      `SELECT d.*, COALESCE(SUM(di.price), 0) AS total_price
      FROM ${Tables.DRAW} d LEFT JOIN ${Tables.D_ITEM} di ON d.id = di.draw_id
      WHERE d.closing_date > CURRENT_TIMESTAMP
      GROUP BY d.id
      ORDER BY total_price DESC, d.closing_date DESC
      LIMIT 1;
      `
    );
    return new Draw(draw.rows[0]);
  }

  static async getFeaturedDraws(client: PoolClient) {
    const draws = await client.query(
      `SELECT d.*, 
      COALESCE(SUM(di.price), 0) AS total_price, 
      ARRAY_AGG(DISTINCT di.image_path) AS draw_images
      FROM ${Tables.DRAW} d LEFT JOIN ${Tables.D_ITEM} di ON d.id = di.draw_id
      WHERE d.closing_date > CURRENT_TIMESTAMP
      GROUP BY  d.id
      ORDER BY total_price DESC, d.closing_date DESC
      OFFSET 1 LIMIT 2;
      `
    );
    return draws.rows.map((draw: DrawData) => new Draw(draw));
  }

  static async getUpcomingDraws(client: PoolClient) {
    const allDraws = await client.query(
      `SELECT * FROM ${Tables.DRAW} WHERE closing_date > CURRENT_TIMESTAMP;`
    );
    return allDraws.rows.map((draw: DrawData) => new Draw(draw));
  }

  static async getUpcomingDrawsUnder4Hours(client: PoolClient) {
    const allDraws = await client.query(
      `SELECT * FROM ${Tables.DRAW} WHERE closing_date <= CURRENT_TIMESTAMP + interval '4 hours' AND closing_date > CURRENT_TIMESTAMP;`
    );
    return allDraws.rows.map((draw: DrawData) => new Draw(draw));
  }

  static async register(data: NewDraw, client: PoolClient) {
    const draw = await client.query(
      `INSERT INTO ${Tables.DRAW} 
      ("title", "brief", "image_path", "opening_date", "closing_date", "country", "location", "category")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, title`,
      [
        data.title,
        data.brief,
        data.imagePath,
        data.openingDate,
        data.closingDate,
        "UK",
        data.location,
        data.category,
      ]
    );
    return new Draw(draw.rows[0]);
  }
}
