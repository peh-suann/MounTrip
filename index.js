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
const bcryptjs = require('bcryptjs')
const bcrypt = require('bcrypt')
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
//會員中心用的所有資料
app.use('/member', require('./routes/member-data'))
//測試資料庫連線，抓會員資料
// app.get('/member', async (req, res) => {
//   const [rows] = await db.query('SELECT * FROM `member` ORDER BY sid ASC')
//   res.json(rows)
// })

// app.use('/member-data',require("./routes/member-data"))

//生成batch假資料用的頁面
app.use('/data', require('./routes/get-random-data'))


//login的路由
app.use('/login', require('./routes/login'))

//測試新的路由
// app.use('/test', require('./routes/test'))

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
