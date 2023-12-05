const DRAW = require("../utils/constants/tables").DRAW;

module.exports = class Draw {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.brief = data.brief;
    this.type = data.type;
    this.imagePath = data.image_path;
    this.openingDate = data.opening_date;
    this.creationDate = data.creation_date;
    this.closingDate = data.closing_date;
    this.winner = data.winner;
  }

  static async getAll(client) {
    const allDraws = await client.query(`SELECT * FROM ${DRAW};`);

    const draws = allDraws.rows.map((draw) => new Draw(draw));
    return draws;
  }
};