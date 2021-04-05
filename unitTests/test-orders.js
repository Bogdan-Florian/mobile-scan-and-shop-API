import test from 'ava'
import sqlite from 'sqlite-async'
import Accounts from '../modules/accounts.js'
import Orders from '../modules/orders.js'

test('INSERT: insert with valid details', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	try{
		await orders.insert('pending', currentDate, 1)
		const sql = 'SELECT order_number FROM orders ORDER BY time_created DESC LIMIT 0,1'
		const order = await db.get(sql)
		test.deepEqual(await orders.insert('pending', currentDate, 1), order)
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('INSERT: insert with inexistent account', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	try{
		await orders.insert('pending', currentDate, 3)
		test.fail('error not thrown')
	} catch(err) {
		//console.log(err)
		test.is(err.message, 'Inexistent user')
	} finally {
		db.close()
	}
})

test.todo('INSERT: insert with invalid status')

test('GET: get specific order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	let currentTime = await new Date()
	const time = currentTime.toISOString().split('.')[0]
	currentTime = await new Date(time)
	try{
		await orders.insert('pending', currentTime, 1)
		const order = {
			order_number: 1,
			status: 'pending',
			time_created: currentTime,
			user_id: 1
		}
		test.deepEqual(await orders.getOrder(1), order)
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('GET: get an order that does not exist', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		await orders.insert('pending', currentTime, 2)
		await orders.getOrder(3)
		test.fail('error not thrown')
	} catch(err) {
		//console.log(err.message)
		test.is(err.message, 'Not existing order')
	} finally {
		db.close()
	}
})

test('GET: invalid order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		console.log(await orders.getOrder(-2))
		test.fail('error not thrown')
	} catch(err) {
		//console.log(err.message)
		test.is(err.message, 'Invalid data')
	} finally {
		db.close()
	}
})

test('DELETE: delete method test', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		test.is(await orders.delete(1),true)
	} catch(err) {
		// 		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('DELETE: delete inexisting order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		await orders.delete(2)
		test.fail('error not thrown')
	} catch(err) {
		// 		console.log(err)
		test.is(err.message, 'Inexisting order')
	} finally {
		db.close()
	}
})

test('DELETE: invalid data', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		await orders.delete(0)
		test.fail('error not thrown')
	} catch(err) {
		// 		console.log(err)
		test.is(err.message, 'Invalid data')
	} finally {
		db.close()
	}
})

test('UPDATE: test update method', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		test.is(await orders.update(1, 'finished'),true)
	} catch(err) {
		// 		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('UPDATE: test not existing order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		await orders.update(2, 'finished')
		test.fail('error not thrown')
	} catch(err) {
		// 		console.log(err)
		test.is(err.message, 'Inexisting order')
	} finally {
		db.close()
	}
})

test.todo('UPDATE: test with inexisting status')

test('UPDATE: Invalid data', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	try{
		await orders.insert('pending', currentTime, 1)
		await orders.update(-1, 'finished')
		test.fail('error not thrown')
	} catch(err) {
		// 		console.log(err)
		test.is(err.message, 'Invalid data')
	} finally {
		db.close()
	}
})

test('GET: get all orders', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentTime = await new Date()
	const time = currentTime.toISOString()
	try{
		await orders.insert('pending', time, 1)
		const data = [
			{
				order_number: 1,
				status: 'pending',
				user_id: 1
			}
		]
		test.deepEqual(await orders.getOrders(), data)
	} catch(err) {
		// 		console.log(err)
		test.fail('error not thrown')
	} finally {
		db.close()
	}
})
