
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

router.get('/orders', async ctx => {
	console.log('GET /orders')
	const orders = await new Orders(dbName)
	try {
        ctx.set('Allow', 'GET, POST')
        const host = ctx.request.host
        console.log(host)
		const record = await orders.getOrders()
        record.forEach(order => {
		order.url = `https://${host}/orders/${order.order_number}`
	})
		const data = {
		name: 'orders',
		desc: 'a list of the orders and their details',
		schema: {
            "username": 'string',
            "status": 'string'
		},
		data: record
	}
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(data, null, rows)
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

router.get('/orders/:order_number', async ctx => {
	console.log('GET /order/order_number')
	const items = await new Items(dbName)
	try {
        ctx.set('Allow', 'GET, PUT, DELETE')
		const order = await items.getBasket(parseInt(ctx.params.order_number))
		const data =  {
		order_number: `${ctx.params.order_number}`,
		desc: `details for order ${ctx.params.order_number}`,
		schema: {
			order_number: 'string',
			items: 'JSON string'
		},
		data: order
	}
		// finally send the http response
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(data, null, rows)
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

router.post('/orders', async ctx => {
	console.log('POST /order')
	const orders = await new Orders(dbName)
	const accounts = await new Accounts(dbName)
	const currentTime = await new Date()
	try {
        ctx.set('Allow', 'GET, POST')
		const data = ctx.request.body
		const userId = await accounts.getUserId(data.username)
		await orders.insert(data.status, currentTime, userId)
        const host = ctx.request.host
        const url = `https://${host}/orders`
		ctx.response.status = 303
		ctx.response.redirect(url)
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

router.delete('/orders/:order_number', async ctx => {
	console.log('DELETE /order/order_number')
	const orders = await new Orders(dbName)
	try {
        ctx.set('Allow', 'GET, PUT, DELETE')
		await orders.delete(parseInt(ctx.params.order_number))
		const host = ctx.request.host
        const url = `https://${host}/orders`
		ctx.response.status = 303
		ctx.response.redirect(url)
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

router.put('/orders/:order_number/:status', async ctx => {
	console.log('UPDATE /order/order_number/status')
	const orders = await new Orders(dbName)
	try {
         ctx.set('Allow', 'GET, PUT, DELETE')
		await orders.update(parseInt(ctx.params.order_number), ctx.params.status)
		const host = ctx.request.host
        const url = `https://${host}/orders`
		ctx.response.status = 303
		ctx.response.redirect(url)
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




export default router
