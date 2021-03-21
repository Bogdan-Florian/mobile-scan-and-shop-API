import test from 'ava'
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