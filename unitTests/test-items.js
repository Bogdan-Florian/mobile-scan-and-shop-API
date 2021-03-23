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

test.only('INSERT: insert item in basket', async test => {
	const db = await sqlite.open(':memory:')
    const accounts = await new Accounts(db)
    accounts.testSetup()
    const orders = await new Orders(db)
    const currentDate = await new Date()
    await orders.insert('pending', currentDate, 1)
    const items = await new Items()
    try{
        await items.testSetup()
        test.is(await items.addItem(1, 1), true)
    } catch (err){
        console.log(err)
        test.fail('error thrown')
    } finally {
        db.close()
    }
})

