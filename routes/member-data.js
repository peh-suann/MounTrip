const express = require('express')
const db = require('../modules/db_connection')
const jwt = require('jsonwebtoken')

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
    const sql = `SELECT * FROM member 
    WHERE 1 
    ORDER BY sid ASC 
    LIMIT ${(page - 1) * perPage},${perPage}`
    ;[rows] = await db.query(sql)
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

//驗證用的callback func
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  // console.log('authHeader', authHeader)
  const token = authHeader && authHeader.split(' ')[1]
  //check if thet token under 'BEARER' is valid
  if (!token) return res.sendStatus(402)
  //驗證（解碼）這個token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) //有看到token但帳號密碼不正確
    req.user = user
    next()
  })
}

router.get('/me/:mid', authenticateToken, async (req, res) => {
  //res.json(res.locals.bearer)

  if (!req.params.mid === req.user.accountId) return res.sendStatus(403)
  const sql = `SELECT * FROM member 
  WHERE sid=?`
  const [rows] = await db.query(sql, [req.params.mid])

  if (rows && rows.length) {
    res.json(rows[0])
  } else {
    res.json({ msg: 'no data' })
  }
})

router.get('/api', async (req, res) => {
  res.json(await getListData(req, res))
})

module.exports = router
