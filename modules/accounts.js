
/** @module Accounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

const saltRounds = 10
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
			if(typeof dbName === 'string') {
				this.db = await sqlite.open(dbName)
			} else {
				this.db = dbName
			}
			const sql = 'CREATE TABLE IF NOT EXISTS accounts\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * register new user
	 * @param {String} username - the selected username
	 * @param {String} password - the selected password
	 * @param {String} email - the selected email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async register(username, password, email) {
		Array.from(arguments).forEach( argument => {
			if(argument === '') throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as number FROM accounts WHERE username="${username}";`
		const usernames = await this.db.get(sql)
		if(usernames.number !== 0) throw new Error(`username "${username}" already in use`)
		sql = `SELECT COUNT(id) as number FROM accounts WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.number !== 0) throw new Error(`email address "${email}" already in use`)
		password = await bcrypt.hash(password, saltRounds)
		sql = `INSERT INTO accounts(username, password, email) VALUES("${username}", "${password}", "${email}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * checks login credentials
	 * @param {String} username - the username to check
	 * @param {String} password - the password to check
	 * @returns {Boolean} return true if credentials are valid
	 */
	async login(credentials) {
		console.log(credentials)
		const {username, password} = credentials
		let sql = `SELECT count(id) AS number FROM accounts WHERE username="${username}";`
		const records = await this.db.get(sql)
		if(!records.number) throw new Error(`username "${username}" is incorrect`)
		sql = `SELECT password FROM accounts WHERE username = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.password)
		if(valid === false) throw new Error(`incorrect password for user "${username}"`)
		return true
	}

	/**
	 * get the user's id by username
	 * @param {String} username - the username to check
	 * @returns {Number} returns the user's id
	 */
	async getUserId(username) {
		let sql = 'SELECT username from accounts'
		const usernames = await this.db.all(sql)
		const userList = []
		for(const user of usernames) userList.push(user.username)
		if(!userList.includes(username)) throw new Error('Inexisting username')
		sql = `SELECT id FROM accounts WHERE username="${username}";`
		const data = await this.db.get(sql)
		return data.id
	}

	async testSetup() {
		const defaultPassword = '$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO'
		const users = [
			`INSERT INTO accounts(username, password, email) VALUES("snewj", "${defaultPassword}", "snewj@gmail.com")`,
			`INSERT INTO accounts(username, password, email) VALUES("starks", "${defaultPassword}", "starks@gmail.com")`
		]
		users.forEach( async sql => await this.db.run(sql))
		const records = await this.db.run('SELECT * FROM accounts')
		return records
	}

	async close() {
		await this.db.close()
	}
}

export default Accounts
