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

const app = express()

//DB連接
const db = require('./modules/db_connection')
const { application } = require('express')
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

//首頁
app.get('/', (req, res) => {
  res.send('<h1>MounTrip首頁</h1>')
})

app.use('/member', require('./routes/member-data'))

//測試資料庫連線，抓會員資料
// app.get('/member', async (req, res) => {
//   const [rows] = await db.query('SELECT * FROM `member` ORDER BY sid ASC')
//   res.json(rows)
// })

// app.use('/member-data',require("./routes/member-data"))

app.use('/trails', require('./routes/trails-data'))

app.use('/batch', require('./routes/batch-data'))

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
