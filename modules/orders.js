
/** @module Orders */

import sqlite from 'sqlite-async'

/**
 * Orders
 * ES6 module that handles inserting, deleting and updating orders.
 */
class Orders {
	/**
     * Create an order object
     * @param {String} [dbName=":memory:"] - The name of the database file to use.
     */
	constructor(dbName = ':memory:') {
		return (async() => {
			if(typeof dbName === 'string') {
				this.db = await sqlite.open(dbName)
			} else {
				this.db = dbName
			}
			const sql = 'CREATE TABLE IF NOT EXISTS orders(\
                        order_number INTEGER PRIMARY KEY AUTOINCREMENT,\
                        status TEXT NOT NULL,\
                        time_created DATETIME NOT NULL,\
                        user_id INT UNSIGNED NOT NULL, \
                        FOREIGN KEY(user_id) REFERENCES accounts(id)\
                    );'
			await this.db.run(sql)
			return this
		})()
	}
    
    /**
     * Gets all the orders
     * @returns {Object[]} return list of all the orders
     */
    async getOrders(){
        const sql = 'SELECT order_number, status, user_id FROM orders;'
        const data = await this.db.all(sql)
        console.log(data)
        return data
    }
    

	/**
     * Inserts a new order
     * @param {String} status the state of the order
     * @param {String} time_order the time at which the order was inserted
     * @param {Number} user_id the id of the user that inserts the order
     * @returns {Object} return the last order number
     */
	async insert(status,timeOrder,userId) {
		let sql = `SELECT COUNT(id) AS count FROM accounts WHERE id = '${userId}';`
		const id = await this.db.get(sql)
		if(!id.count) throw new Error('Inexistent user')
		sql = `INSERT INTO orders(status,time_created, user_id) \
                 VALUES('${status}', '${timeOrder}', ${userId});`
		await this.db.run(sql)
        sql = `SELECT order_number FROM orders ORDER BY time_created DESC LIMIT 0,1`
        const order = await this.db.get(sql)
		return order
	}

	/**
     * Get a particular order
     * @param {Number}
     * @returns {Oject} returns the order and its properties
     */
	async getOrder(id) {
		if (id <= 0) throw new Error('Invalid data')
		let sql = 'SELECT order_number from orders;'
		const orders = await this.db.all(sql)
		const idList = []
		for(const orderNum of orders) idList.push(orderNum.order_number)
        console.log(idList, id)
		if(!idList.includes(id)) throw new Error('Not existing order')
		sql = `SELECT order_number, status, time_created, user_id FROM orders WHERE order_number = ${id};`
		const order = await this.db.get(sql)
		const date = new Date(order.time_created)
		order.time_created = date
		return order
	}

	/**
     * Cancel a specific order
     * @param {Number} id the id of the order to cancel
     * @returns {Boolean} returns true of the order was deleted
     */
	async delete(id) {
		if (id <= 0) throw new Error('Invalid data')
		let sql = 'SELECT order_number from orders;'
		const orders = await this.db.all(sql)
		const idList = []
		for(const orderNum of orders) idList.push(orderNum.order_number)
		if(!idList.includes(id)) throw new Error('Inexisting order')
		sql = `DELETE FROM orders WHERE order_number="${id}";`
		await this.db.run(sql)
		console.log('Canceled Successfully')
		return true
	}

	/**
     * Updates an order's status
     * @param {Number} id order's id
     * @param {String} status the status with which to update the order
     * @returns {Boolean} returns true if updated successfully
     */
	async update(id, status) {
		if (id <= 0) throw new Error('Invalid data')
		let sql = 'SELECT order_number from orders;'
		const orders = await this.db.all(sql)
		const idList = []
		for(const orderNum of orders) idList.push(orderNum.order_number)
		if(!idList.includes(id)) throw new Error('Inexisting order')
		sql = `UPDATE orders SET status = '${status}' WHERE order_number = ${id};`
		await this.db.run(sql)
		console.log('Updated Successfully')
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Orders
