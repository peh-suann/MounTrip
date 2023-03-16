// 通訊埠設定 .env
if (process.argv[2] && process.argv[2] === 'production') {
  require('dotenv').config({
    path: './production.env',
  })
} else {
  require('dotenv').config({
    path: './dev.env',
  })
}
const express = require('express')
const session = require('express-session')
const MysqlStore = require('express-mysql-session')(session)
const Jimp = require('Jimp')
const moment = require('moment-timezone')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const app = express()

//DB連接
const db = require('./modules/db_connection')
const { application, json } = require('express')
const sessionStore = new MysqlStore({}, db) //一定要給的連線設定

//頂層的中介處理 Top-level Middleware
//cors 通行證 寫在後端
const corsOptions = {
  Credential: true,
  origin: function (origin, cb) {
    console.log({ origin })
    cb(null, true)
  },
}

// top-level middlewares
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: 'jdkfksd8934-@_75634kjdkjfdkssdfg',
    store: sessionStore,
    cookie: {
      // maxAge: 1200_000
    },
  })
)

app.use(cors(corsOptions))

//傳入資料解析為json格式
app.use(express.json())

router.use((req, res, next) => {
  next()
})
//首頁
app.get('/', (req, res) => {
  res.send('<h1>MounTrip首頁</h1>')
})

app.get('/try-db', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM trails LIMIT 5')
  res.json([rows])
})

app.use('/', require('./routes/Ian.js'))
app.use('/member', require('./routes/member-data'))

// app.use('/trails',require('./routes/member-data'))
//測試資料庫連線，抓會員資料
// app.get('/member', async (req, res) => {
//   const [rows] = await db.query('SELECT * FROM `member` ORDER BY sid ASC')
//   res.json(rows)
// })

// app.use('/member-data',require("./routes/member-data"))

app.use('/trails', require('./routes/trails-data'))

app.use('/batch', require('./routes/batch-data'))

app.use('/trails-batch', require('./routes/trails-batch'))
//生成batch假資料用的頁面
app.use('/data', require('./routes/get-random-data'))

//login的路由
// app.use('/login', require('./routes/login'))
app.post('/login', async (req, res) => {
  const output = {
    success: false,
    error: '帳號或密碼錯誤 !!!',
    code: 0,
    postData: req.body,
    token: '',
  }

  const sql = 'SELECT * FROM member WHERE account=?'

  const [rows] = await db.query(sql, [req.body.account])

  if (!rows.length) {
    // 帳號是錯的
    output.code = 401
    return res.json(output)
  }

  let passwordCorrect = false // 預設密碼是錯的
  try {
    passwordCorrect = await bcrypt.compare(req.body.password, rows[0].password)
  } catch (ex) {}

  if (!passwordCorrect) {
    // 密碼是錯的
    output.code = 402
  } else {
    output.success = true
    output.code = 200
    output.error = ''

    req.session.member = {
      sid: rows[0].sid,
      account: rows[0].account,
    }
    output.token = jwt.sign(
      {
        sid: rows[0].sid,
        account: rows[0].account,
      },
      process.env.JWT_SECRET
    )
    output.accountId = rows[0].sid
    output.account = rows[0].account
  }
  res.json(output)
})

//測試新的路由
// app.use('/test', require('./routes/test'))

// --yichun fetch products data
app.use('/products', require('./routes/yichun_all_products'))
app.use('/products_popular', require('./routes/yichun_popular_products'))
app.use('/products_hotspring', require('./routes/yichun_theme_hotspring'))
app.use('/test', require('./routes/yichun_test'))
app.use('/answer', require('./routes/yichun_answer'))

//404頁面
app.use((req, res) => {
  res.status(404).send(`
        <h1>找不到此頁面</h1>
        <h2>山林知識：在山上迷路要原地等待救援</h2>
        `)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`伺服器啟動:${port}`)
})
