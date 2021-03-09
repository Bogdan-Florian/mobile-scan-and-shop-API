
/** @module Accounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'


/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Accounts {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	async testSetup() {
		const defaultPassword = 'p455w0rd'
		const users = [
			`INSERT INTO users(user, pass, email) VALUES("bloggsj", "${defaultPassword}", "bloggs@gmail.com")`,
			`INSERT INTO users(user, pass, email) VALUES("doej", "${defaultPassword}", "doej@gmail.com")`
		]
		users.forEach( async sql => await this.db.run(sql))
        const records  = await this.db.run("SELECT * FROM users")
        return records
	}

	async close() {
		await this.db.close()
	}
}

export default Accounts
