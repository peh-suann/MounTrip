const express = require('express')
const db = require('../modules/db_connection')
const cors = require('cors')

const router = express.Router()
const app = express()

//頂層的中介處理 Top-level Middleware
//cors 通行證 寫在後端
// const corsOptions ={
//     Credential: true,
//   origin: function (origin, cb) {
//     console.log({ origin });
//     cb(null, true);
//   },
// }
// app.use(cors(corsOptions))

const getListDat = async (req, res) => {
  let redirect = ''
  const perPage = 25
  let page = +req.query.page || 1

  let queryObj = {}
  let sqlWhere = ' WHERE 1 ' // 條件式的開頭

  //篩選搜尋

  if (page < 1) {
    redirect = req.baseUrl
  }
  //計算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT (1) FROM member WHERE 1`
  )
  const totalPages = Math.ceil(totalRows / perPage)

  //抓指定頁數的資料
  let rows = []
  if (totalRows > 0) {
    const sql = `SELECT * FROM member ORDER BY sid ASC`

    rows = await db.query(sql)
  }

  return {
    perPage,
    page,
    totalPages,
    totalRows,
    rows,
  }
}

router.get('/api', async (req, res) => {
  res.json(await getListDat(req, res))
})

module.exports = router
