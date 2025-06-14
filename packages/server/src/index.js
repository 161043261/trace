/* eslint-disable no-undef */
// pnpm install body-parser express co-body --filter @trace-dev/server
import express from 'express'
import bodyParser from 'body-parser'
import coBody from 'co-body'
import fs from 'node:fs'

const app = express()

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-type', 'application/json;charset=utf-8')
  // 预检 (pre-flight) 请求
  if (req.method.toLowerCase() === 'options') {
    res.sendStatus(200)
  } else {
    next()
  }
}

app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

const router = express.Router()
router.post('/', async (req, res) => {
  try {
    const body = await coBody.json(req)
    console.log(body)
    fs.appendFileSync('trace.log', JSON.stringify(body))
  } catch (err) {
    console.error(err)
  } finally {
    res.end()
  }
})

app.use('/trace', cors, router)

const port = 3333
app.listen(port, () => {
  console.log(`[server] http://localhost:${port}/`)
})
