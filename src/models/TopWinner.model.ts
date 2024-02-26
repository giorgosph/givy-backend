import { PoolClient } from "pg";
import Tables from "../utils/constants/tables";

/* ----- Types ----- */
interface TopWinnerData {
  username: string;
  num_wins: number;
  total_price: number;
}

/* ----------------- */

export default class TopWinner {
  username: string;
  numberOfWins: number;
  totalValue: number;

  constructor(data: TopWinnerData) {
    this.username = data.username;
    this.numberOfWins = data.num_wins;
    this.totalValue = data.total_price;
  }

  static async get(client: PoolClient) {
    const winners = await client.query(
      `SELECT u.username, COUNT(di.id) AS num_wins, COALESCE(SUM(di.price), 0) AS total_price
      FROM ${Tables.USERS} u LEFT JOIN ${Tables.D_ITEM} di ON u.username = di.winner
      GROUP BY u.username HAVING num_wins > 0 ORDER BY total_price DESC, num_wins DESC
      LIMIT 10;`
    );
    return winners.rows.length
      ? winners.rows.map((winner: TopWinnerData) => new TopWinner(winner))
      : false;
  }
}
