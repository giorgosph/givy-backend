import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
interface UserFeedbackData {
  username: string;
  rating: number;
  comments: string;
}

/* ----------------- */

export default class UserFeedback {
  username: string;
  rating: number;
  comments: string;

  constructor(data: UserFeedbackData) {
    this.username = data.username;
    this.rating = data.rating;
    this.comments = data.comments;
  }

  static async upsert(data: UserFeedbackData, client: PoolClient) {
    await client.query(
      `INSERT INTO ${Tables.FEEDBACK} (username, rating, comments) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET rating=$2, comments=$3;`,
      [data.username, data.rating, data.comments]
    );
  }
}
