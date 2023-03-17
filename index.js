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
    // console.log({ origin })
    cb(null, true)
  },
}

app.use(cors(corsOptions))
// top-level middlewares
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: 'jdkfksd8934-@_75634kjdkjfdkssdfg',
  store: sessionStore,
  cookie: {
    // maxAge: 1200_000
  }
}));

app.use(cors(corsOptions))

//傳入資料解析為json格式
app.use(express.json())
//解析透過url傳輸過來的資料
app.use(express.urlencoded({ extended: false }))

//老師的index.js 51行 //檢查HTTPS req中的Authorization是否包含有效的JWT，並將其傳到res.locals.bearer
// app.use((req, res, next) => {
//   res.locals.bearer = {} // 預設值
//   // 取得 headers 裡的 Authorization
//   let auth = req.get('Authorization')
//   if (auth && auth.indexOf('Bearer ') === 0) {
//     //auth存在，且auth是已'bearer'做為前綴
//     auth = auth.split(' ')[1] // token
//     try {
//       res.locals.bearer = jwt.verify(auth, process.env.JWT_SECRET)
//     } catch (ex) {
//       res.sendState(404)
//     }
//   }
//   // console.log('res.locals.bearer:', res.locals.bearer);

//   next()
// })
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

app.use('/trails', require('./routes/trails-data'))

app.use('/batch', require('./routes/batch-data'))

app.use('/trails-filter', require('./routes/trails-filter'))
//生成batch假資料用的頁面
app.use('/data', require('./routes/get-random-data'))

//驗證用的callback func
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  //check if thet token under 'BEARER' is valid
  if (!token) return res.sendStatus(401)
  //驗證（解碼）這個token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) //有看到token但帳號密碼不正確
    req.user = user
    next()
  })
}

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
    output.token = jwt.sign({
      sid: rows[0].sid,
      account: rows[0].account,
    }, process.env.JWT_SECRET);
    output.accountId = rows[0].sid;
    output.account = rows[0].account;
  }
  res.json(output);
});

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

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`伺服器啟動:${port}`)
})
