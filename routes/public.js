
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
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
        ctx.response.body = JSON.stringify(response, null, 2)
	} catch(err) {
		console.log(err)
	} finally {
		await account.close()
	}
})

router.post('/login', async ctx => {
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
        ctx.response.body = JSON.stringify(response, null, 2)
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



export default router
