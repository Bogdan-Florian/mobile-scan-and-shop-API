
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Orders from '../modules/orders.js'
import Items from '../modules/items.js'
import { extractCredentials } from '../modules/util.js'
const dbName = 'website.db'

router.get('/', async context => {
	context.set('Allow', 'GET')
	const data = {
		name: 'Ordering API',
		desc: 'a simple API to handle requests for our application',
		links: [
			{
				name: 'accounts',
				desc: 'use this route to create an account',
				href: `https://${context.host}/accounts`,
			},
			{
				name: 'orders',
				desc: 'a list of orders',
				href: `https://${context.host}/orders`,
			}
		]
	}
	context.status = 200
	const rows = 2
	context.response.body = JSON.stringify(data, null, rows)
})

router.get('/accounts', async ctx => {
	console.log('GET /accounts')
	const account = await new Accounts(dbName)
	try {
		ctx.set('Allow', 'GET, POST')
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		await account.login(credentials)
		const response = {
			status: 'success',
			msg: 'you logged in'
		}
		ctx.response.status = 200
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
	} finally {
		await account.close()
	}
})

router.post('/accounts', async ctx => {
	console.log('POST /accounts')
	const account = await new Accounts(dbName)
	try {
		const data = ctx.request.body
		await account.register(data.username, data.password, data.email)
		const response = {
			status: 'success',
			msg: 'account added',
			data: data
		}
		ctx.response.status = 201
		const rows = 2
		ctx.response.body = JSON.stringify(response, null, rows)
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = JSON.stringify({ status: 'an error occured', msg: err.message })
		return
	} finally {
		await account.close()
	}
})

router.get('/orders', async ctx => {
	console.log('GET /orders')
	let username = null
	try {
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		username = credentials.username
		await account.login(credentials)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
		return
	}
	console.log(username)
	//valid credentials
	const orders = await new Orders(dbName)
	let data = null
	try {
		ctx.set('Allow', 'GET, POST')
		const host = ctx.request.host
		const record = await orders.getOrders()
		record.forEach(order => {
			order.url = `https://${host}/orders/${order.order_number}`
		})
		data = {
			name: 'orders',
			desc: 'a list of the orders and their details',
			schema: {
				status: 'string',
				basket: 'array of objects'
			},
			data: record
		}
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
		return
	} finally {
		await orders.close()
	}
	ctx.response.status = 200
	const rows = 2
	ctx.response.body = JSON.stringify(data, null, rows)
})

router.post('/orders', async ctx => {
	console.log('POST /orders')
	let username = null
	try {
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		username = credentials.username
		await account.login(credentials)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
		return
	}
	const orders = await new Orders(dbName)
	const accounts = await new Accounts(dbName)
	const items = await new Items(dbName)
	const currentTime = await new Date()
	const sqlliteDate = currentTime.toISOString()
	try {
		ctx.set('Allow', 'GET, POST')
		const data = ctx.request.body
		const userId = await accounts.getUserId(username)
		const record = await orders.insert(data.status, sqlliteDate, userId)
		console.log(record)
		await items.addBasket(record.order_number, data.basket)
		ctx.response.status = 201
		ctx.response.body = {status: 'success', msg: 'order created', order_number: record.order_number}
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
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		await account.login(credentials)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
		return
	}
	//valid credentials
	let data = null
	try {
		ctx.set('Allow', 'GET, PUT, DELETE')
		const order = await items.getBasket(parseInt(ctx.params.order_number))
		data = {
			name: `${ctx.params.order_number}`,
			desc: `details for order ${ctx.params.order_number}`,
			schema: {
				status: 'string'
			},
			data: order
		}
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
		return
	} finally {
		await items.close()
	}
	ctx.response.status = 200
	const rows = 2
	ctx.response.body = JSON.stringify(data, null, rows)
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

router.get('/stores/:qr_code', async ctx => {
	console.log('GET /stores/qr_code')
	const items = await new Items(dbName)
	try {
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		await account.login(credentials)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
		return
	}
	let response = null
	try {
		console.log(ctx.params.qr_code)
		const record = await items.getItems(parseInt(ctx.params.qr_code))
		const name = await items.getStore(parseInt(ctx.params.qr_code))
		response = {
			status: 'success',
			name: name.name,
			data: record
		}
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
		return
	} finally {
		await items.close()
	}
	ctx.response.status = 200
	const rows = 2
	ctx.response.body = JSON.stringify(response, null, rows)
})

router.get('/items/:barcode', async ctx => {
	console.log('GET /items/barcode')
	const items = await new Items(dbName)
	try {
		const account = await new Accounts(dbName)
		const token = ctx.get('Authorization')
		if(!token) throw new Error('missing Authorization header')
		const credentials = extractCredentials(token)
		await account.login(credentials)
	} catch(err) {
		ctx.response.status = 401
		ctx.response.body = JSON.stringify({ status: 'unauthorised', msg: err.message })
		return
	}
	let response = null
	try {
		console.log(ctx.params.barcode)
		const record = await items.getItem(ctx.params.barcode)
		response = {
			status: 'success',
			data: record
		}
	} catch(err) {
		console.log(err)
		ctx.response.status = 400
		ctx.response.body = {
			status: 'fail',
			msg: err.message
		}
		return
	} finally {
		await items.close()
	}
	ctx.response.status = 200
	const rows = 2
	ctx.response.body = JSON.stringify(response, null, rows)
})

export default router
