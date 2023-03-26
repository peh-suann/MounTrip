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
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendMagicLinkEmail } = require('./mailer')
const app = express()

//DB連接
const db = require('./modules/db_connection')
const { application, json } = require('express')
const sessionStore = new MysqlStore({}, db) //一定要給的連線設定

//設定'public'資料夾為靜態資料夾，輸入網址可以直接拜訪
//而且不會被CORS擋下，因為這個拜訪不是AJAX
app.use(express.static('public'))
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

//signin的路由
app.post('/signin', async (req, res) => {
  const output = {
    success: false,
    error: '尚未註冊成功 !!!',
    code: 0,
    postData: req.body,
    token: '',
  }

  // console.log(req.body)
  // const sql = "SELECT * FROM member WHERE account=?";
  const sql =
    "INSERT INTO `member`( `account`, `password`, `display`) VALUES (?,?,'1')"

  // console.log(bcrypt.hash(req.body.password))
  const hash = bcrypt.hashSync(req.body.password, 10)
  console.log(hash)
  const [rows] = await db.query(sql, [req.body.account, hash])
  // console.log(rows)
  // console.log(rows.insertId)

  if (!rows.insertId) {
    // 帳號是錯的
    output.code = 401
    return res.json(output)
  }

  if (req.body.password === req.body.password1) {
    output.success = true
    output.code = 200
    output.error = ''

    req.session.member = {
      accountId: rows.insertId,
    }
    output.token = jwt.sign(
      {
        accountId: rows.insertId,
      },
      process.env.JWT_SECRET
    )
    output.account = req.body.account
  } else {
    output.error = '輸入密碼不相同'
  }

  res.json(output)
})

// kexin 忘記密碼寄信
const users =[{
  id:1,
  name:'kexin',
  email: "lu773414@gmail.com"
}]

app.post("/resetPassword", async (req,res) => {
  console.log(req.body.email)
  const user=users.find(u => u.email === req.body.email)

  console.log('user',user)
  if (user != null) {
    try {
      const token = jwt.sign({userId : user.id}, process.env.JWT_SECRET,{
        expiresIn: "1h",
      })
      console.log(token)
      await sendMagicLinkEmail({email:user.email,token})
    } catch (e) {
      return res.send("Error RESET PASSWORD")
    }

    res.send("success")
  }
})

// kexin 忘記密碼路由驗證
app.post('/vertify', (req,res) => {

  const output = {
    success: false,
    error: '未驗證成功 !!!',
    code: 0,
    postData: req.body,
    token: '',
  }

  const token = req.body
  // console.log(token)
  if (token == null) return res.sendStatus(401)


  let tokenCorrect = false // 預設密碼是錯的
  try {
    console.log(jwt.verify(token, process.env.JWT_SECRET))
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decodeToken)
    const user = users.find(u => u.id === decodeToken.userId)
    if (user) {
      tokenCorrect = true
    }
    res.send(`${user.name}`)
    // res.redirect='http:localhost:3000/password'
    output.success = true
    output.code = 200
  } catch (e) {
    res.sendStatus(401)

  }
  
})


// kexin 首頁路由
app.use('/select_products', require('./routes/kexin_select_county_products'))
app.use('/select_comment', require('./routes/kexin_select_comment'))
app.use('/select_batch', require('./routes/kexin_select_batch'))
app.use('/select_member', require('./routes/kexin_select_member'))

//測試新的路由
// app.use('/test', require('./routes/test'))

// --yichun fetch products data
app.use('/search', require('./routes/yichun_search_products'))
app.use('/products', require('./routes/yichun_all_products'))
app.use('/products_popular', require('./routes/yichun_popular_products'))
app.use('/products_sunrise', require('./routes/yichun_popular_sunrise'))
app.use('/products_holiday', require('./routes/yichun_popular_holiday'))
app.use('/products_flowers', require('./routes/yichun_popular_flowers'))
app.use('/products_hotspring', require('./routes/yichun_theme_hotspring'))
app.use('/products_location', require('./routes/yichun_popular_locations'))
app.use('/weather_location', require('./routes/yichun_weather_location'))
app.use('/test', require('./routes/yichun_test'))
app.use('/test_play', require('./routes/yichun_test_play'))
app.use('/insert_play', require('./routes/yichun_test_insert_play'))
app.use('/insert_coupon', require('./routes/yichun_test_insert_coupon'))
app.use(
  '/member_insert_coupon',
  require('./routes/yichun_member_insert_coupon')
)
app.use('/answer', require('./routes/yichun_answer'))
app.use('/rating_data', require('./routes/rating_datas'))
// app.use('/insert_batch', require('./routes/yichun_insert_batch'))
// app.use('/insert_order', require('./routes/yichun_insert_order'))

app.get('/insert-random-numbers', async (req, res) => {
  try {
    // generate an array of 400 random numbers
    const randomNumbers = []
    for (let i = 0; i < 400; i++) {
      randomNumbers.push(Math.floor(Math.random() * 400) + 1)
    }

    // insert the random numbers into a row
    const query = `UPDATE order_detail SET batch_sid = FLOOR(1 + RAND() * 400) WHERE 1`
    const result = await db.execute(query)

    console.log(result)
    // close the database connection

    // send a response to the client
    res.send('Random numbers inserted successfully!')
  } catch (error) {
    console.error(error)
    res.status(500).send('An error occurred while inserting random numbers.')
  }
})
app.use('/', require('./routes/Ian.js'))

//404頁面
app.use((req, res) => {
  res.status(404).send(`
        <h1>找不到此頁面</h1>
        <h2>山林知識：在山上迷路要原地等待救援</h2>
        `)
})

const port = process.env.PORT || 3002
app.listen(port, () => {
  console.log(`伺服器啟動:${port}`)
})
