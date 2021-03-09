
import Router from 'koa-router'
import bodyParser from 'koa-body'

import publicRouter from './public.js'


const mainRouter = new Router()
mainRouter.use(bodyParser({multipart: true}))

mainRouter.use(publicRouter.routes())
mainRouter.use(publicRouter.allowedMethods())

export default mainRouter
