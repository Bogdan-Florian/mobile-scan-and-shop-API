
/** @module Items */

import sqlite from 'sqlite-async'

/**
 * Items
 * ES6 module that handles getting information about the items.
 */
class Items {
	/**
   * Create an items object
   * @param {String} [dbName=":memory:"] - name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			if(typeof dbName === 'string') {
				this.db = await sqlite.open(dbName)
			} else {
				this.db = dbName
			}
			let sql ='CREATE TABLE IF NOT EXISTS stores (\
                      qr_code INTEGER PRIMARY KEY AUTOINCREMENT,\
                      name TEXT NOT NULL,\
                      address TEXT NOT NULL\
                    );'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS items(\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    description TEXT NOT NULL,\
                    price DOUBLE(8, 2) NOT NULL,\
                    qty INT NOT NULL,\
                    barcode TEXT NOT NULL,\
                    store_id INTEGER NOT NULL,\
                    product_image BLOB NOT NULL,\
                    FOREIGN KEY(store_id) REFERENCES stores(qr_code)\
                );'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS order_item(\
                    order_id INTEGER NOT NULL,\
                    item_id INTEGER NOT NULL,\
                    qty INTEGER NOT NULL,\
                    PRIMARY KEY(order_id, item_id),\
                    FOREIGN KEY(order_id) REFERENCES orders(order_number),\
                    FOREIGN KEY(item_id) REFERENCES items(id)\
                );'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * get item by barcode
	 * @param {String} barcode - the selected barcode
	 * @returns {Object} Returns object with item details
	 */
	async getItem(barcode) {
		let sql = `SELECT COUNT(barcode) AS count FROM items WHERE barcode = '${barcode}';`
		const barcodes = await this.db.get(sql)
		if(!barcodes.count) throw new Error('Not existing item')
		sql = `SELECT * FROM items WHERE barcode = '${barcode}'`
		const data = await this.db.get(sql)
		return data
	}
    
    /**
	 * get item by qrcode
	 * @param {String} barcode - the selected barcode
	 * @returns {Object} Returns object with item details
	 */
	async getItems(qrcode) {
		let sql = `SELECT COUNT(qr_code) AS count FROM stores WHERE qr_code = ${qrcode};`
		const qrcodes = await this.db.get(sql)
		if(!qrcodes.count) throw new Error('Not existing store')
		sql = `SELECT * FROM items WHERE store_id = ${qrcode}`
		const data = await this.db.all(sql)
        console.log(data)
		return data
	}

	/**
	 * get all items from the basket
	 * @param {Number} orderNumber - the id of the order
	 * @returns {Object} Returns object with items and their details
	 */
	async getBasket(orderNumber) {
		if(orderNumber < 0 || orderNumber===0) throw new Error('Invalid data')
		let sql = `SELECT COUNT(order_id) AS count FROM order_item WHERE order_id = '${orderNumber}';`
		const orders = await this.db.get(sql)
		if(!orders.count) throw new Error('Inexisting order')
		sql = `SELECT order_item.item_id, items.description, items.price, order_item.qty AS qty FROM items, order_item \
                WHERE order_item.item_id = items.id AND order_item.order_id = ${orderNumber}`
		const data = await this.db.all(sql)
		return data
	}
    
    /**
	 * add all items from the basket
	 * @param {Number} orderNumber - the id of the order
	 * @param {Object[]} data - the list of items
	 * @returns {Object} Returns object with items and their details
	 */
	async addBasket(order_number, data){
        data.forEach(async (item) => {
            let sql = `INSERT INTO order_item(order_id, item_id, qty) VALUES(${order_number}, ${item.id}, ${item.qty})`
            console.log(sql)
            await this.db.run(sql)
        })
        return true
    }

	async testSetup() {
		const users = [
			'INSERT INTO stores(qr_code, name, address) VALUES("1000000001", "Tesco", "56-66 Cambridge Street")',
			'INSERT INTO stores(qr_code, name, address) VALUES("1000000002", "Sainsbury", "London Road")',
			'INSERT INTO items(description, price, qty, barcode, store_id)\
            VALUES("Honey", 1.99, 1, "00369626", 1)',
			'INSERT INTO items(description, price, qty, barcode, store_id)\
            VALUES("Hell ENERGY DRINK", 0.50, 2, "00797656", 1)',
			'INSERT INTO items(description, price, qty, barcode, store_id) VALUES("Digestives", 1.79, 1, "00768764", 1)'
		]
		users.forEach( async sql => await this.db.run(sql))
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Items
