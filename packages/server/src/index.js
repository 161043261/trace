// pnpm install koa @koa/router @koa/cors koa-bodyparser --filter @trace-dev/server
import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import fs from 'node:fs'
import process from 'node:process'

const app = new Koa()
const router = new Router()
app.use(cors({ origin: '*', allowMethods: ['*'], allowHeaders: ['*'] }))
app.use(bodyParser())
router.post('/trace', async (ctx) => {
  try {
    const body = ctx.request.body
    process.stdout.write(body, '\n')
    const content = `${new Date().toISOString()} ${JSON.stringify(body)}\n`
    fs.appendFileSync('trace.log', content)
    ctx.status = 200
    ctx.body = {
      code: 200,
      message: 'OK'
    }
  } catch (err) {
    process.stdout.write(err, '\n')
    ctx.status = 500
    ctx.body = {
      code: 500,
      message: 'Internal Server Error'
    }
  }
})
app.use(router.routes()).use(router.allowedMethods())
const port = 3333
app.listen(port, () => {
  process.stdout.write(`server: http://localhost:${port}\n`)
})
