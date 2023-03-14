const express = require('express')
const db = require('../modules/db_connection')

const router = express.Router()

router.use((req, res, next) => {
  next()
})


const getListData = async (req, res) => {
  let redirect = ''
  const perPage = 25
  let page = +req.query.page || 1

  // let queryObj = {}
  // let sqlWhere = ' WHERE 1 ' // 條件式的開頭

  //篩選搜尋

  if (page < 1) {
    redirect = req.baseUrl
  }
  //計算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT (1) totalRows FROM member WHERE 1`
  )
  const totalPages = Math.ceil(totalRows / perPage)

  //抓指定頁數的資料
  let rows = []
  if (totalRows > 0) {
    if (page > totalPages) {
      redirect = req.baseUrl + `?page=` + totalPages
    }
    // const sql = (`SELECT * FROM member
    // WHERE 1
    // ORDER BY sid ASC
    // LIMIT ${(page - 1) * perPage},${perPage}`[rows] = await db.query(sql))
  }

  return {
    perPage,
    page,
    totalPages,
    totalRows,
    rows,
    redirect,
  }
}
router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

router.get('/api', async (req, res) => {
  res.json(await getListData(req, res))
})

module.exports = router
