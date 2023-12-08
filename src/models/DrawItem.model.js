const D_ITEM = require("../utils/constants/tables").D_ITEM;

module.exports = class DrawItem {
  constructor(data) {
    this.id = data.id;
    this.drawId = data.draw_id;
    this.title = data.title;
    this.category = data.category;
    this.description = data.description;
    this.imagePath = data.image_path;
    this.brief = data.brief;
    this.price = data.price;
    this.winner = data.winner;
  }

  static async getAll(client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM};`);

    const items = allItems.rows.map((item) => new DrawItem(item));
    return items;
  }

  /* ----------------- Finders ----------------- */
  /* ------------------------------------------- */  

  static async findByDrawID(drawId, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE draw_id=$1;`, [drawId]);

    const item = allItems.rows.map((item) => new DrawItem(item));
    return item;
  }  

  static async findByWinner(username, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE winner=$1;`, [username]);

    const item = allItems.rows.map((item) => new DrawItem(item));
    return item;
  }
};