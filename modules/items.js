
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
                    order_id INTEGER,\
                    item_id INTEGER,\
                    qty INT NOT NULL,\
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
    async getItem(barcode){
        let sql = `SELECT COUNT(barcode) AS count FROM items WHERE barcode = '${barcode}';`
        const barcodes = await this.db.get(sql)
        if(!barcodes.count) throw new Error('Not existing item')
        sql = `SELECT * FROM items WHERE barcode = '${barcode}'`
        const data = await this.db.get(sql)
        return data
    }
	
	async testSetup() {
		const users = [
			'INSERT INTO stores(qr_code, name, address) VALUES("1000000001", "Tesco", "56-66 Cambridge Street")',
			'INSERT INTO stores(qr_code, name, address) VALUES("1000000002", "Sainsbury", "London Road")',
            'INSERT INTO items(description, price, qty, barcode, store_id) VALUES("Honey", 1.99, 1, "00369626", 1)',
            'INSERT INTO items(description, price, qty, barcode, store_id) VALUES("Hell ENERGY DRINK", 0.50, 1, "00797656", 1)',
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