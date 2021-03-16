
import Koa from 'koa'
import session from 'koa-session'

import router from './routes/routes.js'

const app = new Koa()

const defaultPort = 8086
const port = process.env.PORT || defaultPort


app.use(session(app))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, async() => console.log(`listening on port ${port}`))
