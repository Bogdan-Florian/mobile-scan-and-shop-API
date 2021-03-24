
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Orders from '../modules/orders.js'
import Items from '../modules/items.js'
const dbName = 'website.db'


router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		const data = ctx.request.body
		await account.register(data.username, data.password, data.email)
		const response = {
			status: 'success',
			msg: 'account added',
			data: data
		}
		// finally send the http response
		ctx.response.status = 201
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
	} finally {
		await account.close()
	}
})

router.post('/login', async ctx => {
	console.log('POST /login')
	const account = await new Accounts(dbName)
	try {
		const data = ctx.request.body
		await account.login(data.username, data.password)
		// 		ctx.session.authorised = true
		const response = {
			status: 'success',
			msg: 'you logged in',
			data: data
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await account.close()
	}
})

router.get('/item/:barcode', async ctx => {
	console.log('GET /item/barcode')
	const items = await new Items(dbName)
	try {
		console.log(ctx.params.barcode)
		const record = await items.getItem(ctx.params.barcode)
		const response = {
			status: 'success',
			data: record
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await items.close()
	}
})

router.get('/order/:order_number', async ctx => {
	console.log('GET /order/order_number')
	const orders = await new Orders(dbName)
	try {
		const record = await orders.getOrder(ctx.params.order_number)
		const response = {
			status: 'success',
			data: record
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await orders.close()
	}
})

router.post('/order', async ctx => {
	console.log('POST /order')
	const orders = await new Orders(dbName)
	const accounts = await new Accounts(dbName)
	const currentTime = await new Date()
	try {
		const data = ctx.request.body
		const userId = await accounts.getUserId(data.username)
		await orders.insert(data.status, currentTime, userId)
		const response = {
			status: 'success',
			msg: 'order has been created'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await orders.close()
	}
})

router.delete('/order/:order_number', async ctx => {
	console.log('DELETE /order/order_number')
	const orders = await new Orders(dbName)
	try {
		await orders.delete(ctx.params.order_number)
		const response = {
			status: 'success',
			ms: 'order has been deleted'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await orders.close()
	}
})

router.update('/order/:order_number/:status', async ctx => {
	console.log('UPDATE /order/order_number/status')
	const orders = await new Orders(dbName)
	try {
		await orders.update(ctx.params.order_number, ctx.params.status)
		const response = {
			status: 'success',
			ms: 'order has been updated'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await orders.close()
	}
})

router.get('/basket/:order_number', async ctx => {
	console.log('GET /basket/order_number')
	const items = await new Items(dbName)
	try {
		const record = await items.getBasket(ctx.params.order_number)
		const response = {
			status: 'success',
			data: record
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await items.close()
	}

})

router.post('/basket', async ctx => {
	console.log('POST /basket')
	const items = await new Items(dbName)
	try {
		const data = ctx.request.body
		await items.addItem(data.order_number, data.item_id, data.qty)
		const response = {
			status: 'success',
			msg: 'item has been added to the basket'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await items.close()
	}
})

router.delete('/basket/:order_number/:item_id', async ctx => {
	console.log('DELETE /basket/order_number/item_id')
	const items = await new Items(dbName)
	try {
		await items.deleteItem(ctx.params.order_number, ctx.params.item_id)
		const response = {
			status: 'success',
			msg: 'item has been deleted'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await items.close()
	}
})

router.update('/basket/:order_number/:item_id/:qty', async ctx => {
	console.log('UPDATE /order/order_number/item_id/qty')
	const items = await new Items(dbName)
	try {
		await items.update(ctx.params.order_number, ctx.params.item_id, ctx.params.qty)
		const response = {
			status: 'success',
			ms: 'item\'s quantity has been updated'
		}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
	} finally {
		await items.close()
	}
})


export default router
