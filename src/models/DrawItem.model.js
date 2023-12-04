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
  }

  static async getAll(client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM};`);

    const items = allItems.rows.map((item) => new DrawItem(item));
    return items;
  }

  /* ------------------- Get Items ------------------- */

  static async getByDrawID(drawId, client) {
    const allItems = await client.query(`SELECT * FROM ${D_ITEM} WHERE draw_id=$1;`, [drawId]);

    if(allItems.rows.length > 0) {
      const items = allItems.rows.map((item) => new DrawItem(item));
      return items;
    } else return false
  }  
};