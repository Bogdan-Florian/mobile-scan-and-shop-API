
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
const dbName = 'website.db'


router.get('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		const records = await account.testSetup()
        ctx.response.body = records
	} catch(err) {
		console.log(err)
	} finally {
		await account.close()
	}
})



export default router
