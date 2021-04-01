
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
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    qr_code TEXT NOT NULL,\
                    name TEXT NOT NULL,\
                    address TEXT NOT NULL);'
			await this.db.run(sql)
			sql = 'CREATE TABLE IF NOT EXISTS items(\
                        id INTEGER PRIMARY KEY AUTOINCREMENT,\
                        description TEXT NOT NULL,\
                        price DOUBLE(8, 2) NOT NULL,\
                        qty INT NOT NULL,\
                        barcode TEXT NOT NULL,\
                        store_id INT NOT NULL,\
                        FOREIGN KEY(store_id) REFERENCES stores(id));'
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
     * add item to the basket
     * @param {Number} orderNumber - the id of the order
     * @param {Number} itemId - the id of the item
     * @param {Number} qty - the quantity of the item
     * @returns {Boolean} returns true if the item was added
     */
	async addItem(orderNumber, itemId, qty) {
		const inputs = Array.from(arguments)
		for(let i=0; i<inputs.length;i++) if(inputs[i]<0 || inputs[i]===0) throw new Error('Invalid data')
		let sql = `SELECT COUNT(order_number) AS count FROM orders WHERE order_number = '${orderNumber}';`
		const orders = await this.db.get(sql)
		if(!orders.count) throw new Error('Inexisting order')
		sql = `SELECT COUNT(id) AS count FROM items WHERE id = '${itemId}';`
		const items = await this.db.get(sql)
		if(!items.count) throw new Error('Inexisting item')
		sql = `SELECT qty FROM items WHERE id = '${itemId}';`
		const item = await this.db.get(sql)
		if(item.qty < qty) throw new Error('Quantity is not available')
		sql = `INSERT INTO order_item(order_id, item_id, qty)\
                    VALUES(${orderNumber}, ${itemId}, ${qty});`
		await this.db.run(sql)
		return true
	}

	/**
     * delete item from the basket
     * @param {Number} orderNumber - the id of the order
     * @param {Number} itemId - the id of the item
     * @returns {Boolean} returns true if the item was deleted
     */
	async deleteItem(orderNumber, itemId) {
		const inputs = Array.from(arguments)
		for(let i=0; i<inputs.length;i++) if(inputs[i]<0 || inputs[i]===0) throw new Error('Invalid data')
		let sql = `SELECT COUNT(order_id) AS count FROM order_item WHERE order_id = '${orderNumber}';`
		const orders = await this.db.get(sql)
		if(!orders.count) throw new Error('Inexisting order')
		sql = `SELECT COUNT(item_id) AS count FROM order_item WHERE item_id = '${itemId}';`
		const items = await this.db.get(sql)
		if(!items.count) throw new Error('Item not in basket')
		sql = `DELETE FROM order_item WHERE order_id=${orderNumber} AND item_id = ${itemId};`
		await this.db.run(sql)
		return true
	}

	/**
     * updates the quantity of a specific item in the basket
     * @param {Number} orderNumber - order's id
     * @param {Number} itemId - the id of the item
     * @param {Number} qty - the new qty
     * @returns {Boolean} returns true if updated successfully
     */
	async changeQty(orderNumber, itemId, qty) {
		const inputs = Array.from(arguments)
		for(let i=0; i<inputs.length;i++) if(inputs[i]<0 || inputs[i]===0) throw new Error('Invalid data')
		let sql = 'SELECT order_number from orders;'
		const orders = await this.db.all(sql)
		const idList = []
		for(const orderNum of orders) idList.push(orderNum.order_number)
		if(!idList.includes(orderNumber)) throw new Error('Inexisting order')
		sql = `SELECT COUNT(item_id) AS count FROM order_item WHERE item_id = ${itemId} AND order_id = ${orderNumber};`
		const items = await this.db.get(sql)
		if(!items.count) throw new Error('Item not in basket')
		sql = `SELECT qty FROM items WHERE id = '${itemId}';`
		const item = await this.db.get(sql)
		if(item.qty < qty) throw new Error('Quantity is not available')
		sql = `UPDATE order_item SET qty = ${qty} WHERE order_id = ${orderNumber} AND item_id = ${itemId};`
		await this.db.run(sql)
		console.log('Updated Successfully')
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
