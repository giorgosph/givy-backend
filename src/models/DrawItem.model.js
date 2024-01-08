const D_ITEM = require("../utils/constants/tables").D_ITEM;

module.exports = class DrawItem {
  constructor(data) {
    this.id = data.id;
    this.drawId = data.draw_id;
    this.title = data.title;
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
  };

  /* ----------------- Finders ----------------- */
  /* ------------------------------------------- */  

  static async findByDrawID(drawId, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE draw_id=$1 ORDER BY price DESC;`, [drawId]);

    const items = allItems.rows.map((item) => new DrawItem(item));
    return items;
  };  

  static async findByDrawIDSortByPrice(drawId, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE draw_id=$1 ORDER BY price ASC;`, [drawId]);

    const items = allItems.rows.map((item) => new DrawItem(item));
    return items;
  };  

  static async findByWinner(username, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE winner=$1;`, [username]);

    const items = allItems.rows.map((item) => new DrawItem(item));
    return items;
  };

  /* ----------------- Updates ----------------- */
  /* ------------------------------------------- */  

  static async setWinner(data, client) {
    await client.query(
      `UPDATE ${D_ITEM} SET winner=$1 WHERE draw_id=$2 AND id=$3;`, 
      [data.username, data.drawId, data.id]
    );
  };
};