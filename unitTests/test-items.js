import test from 'ava'
import sqlite from 'sqlite-async'
import Accounts from '../modules/accounts.js'
import Orders from '../modules/orders.js'
import Items from '../modules/items.js'

test('GET: get item by barcode', async test => {
	test.plan(1)
	const items = await new Items()
	try {
		await items.testSetup()
		const item = {
			id: 1,
			description: 'Honey',
			price: 1.99,
			qty: 1,
			barcode: '00369626',
			store_id: 1
		}
		test.deepEqual(await items.getItem('00369626'), item)
	} catch(err) {
		console.log(err.message)
		test.fail('error thrown')
	} finally {
		items.close()
	}
})

test('GET: get item by barcode - not existing item', async test => {
	test.plan(1)
	const items = await new Items()
	try {
		await items.testSetup()
		await items.getItem('09459645')
		test.fail('error not thrown')
	} catch(err) {
		console.log(err.message)
		test.is(err.message, 'Not existing item')
	} finally {
		items.close()
	}
})

test('INSERT: insert item in basket', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		test.is(await items.addItem(1, 1, 1), true)
	} catch (err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('INSERT: order does not exist', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(2, 1, 1)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Inexisting order')
	} finally {
		db.close()
	}
})

test('INSERT: item does not exist', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 7, 1)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Inexisting item')
	} finally {
		db.close()
	}
})

test('INSERT: quantity is not available', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 2, 3)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Quantity is not available')
	} finally {
		db.close()
	}
})

test('INSERT: invalid data', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 0, -1)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Invalid data')
	} finally {
		db.close()
	}
})

test('DELETE: delete item from basket', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 1, 1)
		test.is(await items.deleteItem(1, 1), true)
	} catch (err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		db.close()
	}
})

test('DELETE: order does not exist', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 1, 1)
		await items.deleteItem(2, 1)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Inexisting order')
	} finally {
		db.close()
	}
})

test('DELETE: item is not in basket', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.addItem(1, 1, 1)
		await items.addItem(1, 2, 1)
		await items.addItem(1, 3, 1)
		await items.deleteItem(1, 7)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Item not in basket')
	} finally {
		db.close()
	}
})

test('DELETE: invalid data', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try{
		await items.testSetup()
		await items.deleteItem(-1, 0)
		test.fail('error not thrown')
	} catch (err) {
		//         console.log(err)
		test.is(err.message, 'Invalid data')
	} finally {
		db.close()
	}
})

test('GET: get items from the basket', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try {
		await items.testSetup()
		await items.addItem(1, 1, 1)
		await items.addItem(1, 2, 1)
		const basket = [
			{ item_id: 1, description: 'Honey', price: 1.99, qty: 1 },
			{ item_id: 2, description: 'Hell ENERGY DRINK', price: 0.5, qty: 1 }
		]
		test.deepEqual(await items.getBasket(1), basket)
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		items.close()
	}
})

test('GET: get items inexisting order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try {
		await items.testSetup()
		await items.addItem(1, 1, 1)
		await items.addItem(1, 2, 1)
		await items.getBasket(2)
		test.fail('error not thrown')
	} catch(err) {
		console.log(err)
		test.is(err.message, 'Inexisting order')
	} finally {
		items.close()
	}
})

test('GET: invalid order', async test => {
	const db = await sqlite.open(':memory:')
	const accounts = await new Accounts(db)
	accounts.testSetup()
	const orders = await new Orders(db)
	const currentDate = await new Date()
	await orders.insert('pending', currentDate, 1)
	const items = await new Items(db)
	try {
		await items.testSetup()
		await items.addItem(1, 1, 1)
		await items.addItem(1, 2, 1)
		await items.getBasket(-1)
		test.fail('error not thrown')
	} catch(err) {
		console.log(err)
		test.is(err.message, 'Invalid data')
	} finally {
		items.close()
	}
})
