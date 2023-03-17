const express = require('express')
const db = require('../modules/db_connection')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')

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

router.get('/me/comment/:mid', authenticateToken, async (req, res) => {
  if (!req.params.mid === req.user.accountId) return res.sendStatus(403)
  const sql = `SELECT * FROM rating 
  WHERE member_sid=?`
  const [rows] = await db.query(sql, [req.params.mid])
  if (rows && rows.length) {
    res.json(rows)
  } else {
    res.json({ msg: 'no required data' })
  }
})

//照片上傳 multer套件，儲存到固定路徑時才能使用diskStorage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images/uploads/')
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname)
//     const filename = Math.random().toString(36).substring(2, 10) + ext

//     cb(null, filename)
//   },
// })
const storage = multer.memoryStorage()
//設定Multer
const upload = multer({
  storage: storage,
  limits: { filesize: 2 * 1024 * 1024 },
})
// const setUserImg = async (req, res) => {}
//大頭照上傳的路由
router.post(
  '/me/upload',
  authenticateToken,
  upload.single('file'), //接收input name = file 的欄位來的資料，一個檔案
  async (req, res) => {
    let fileName = ''
    fileName = req.file.filename
    //FIXME blobFile 未定義
    const blobFile = req.file.buffer
    // const authHeader = req.headers['authorization']
    const sid = req.headers['sid']
    //TODO 重複上傳要怎麼寫？
    const sql = 'UPDATE `member` SET `img`=? WHERE `sid`=? '
    const [result] = await db.query(sql, [blobFile, sid]) //要亂碼的名字選fileName，BLOBfile is for 二進位資料存在db
    // console.log(req.file)
    //FIXME 上傳成功的告示
    const report = {
      code: 200,
      status: '上傳成功',
    }
    res.json({ report })
  }
)
// TODO 加上驗證（&動態路由？）
router.get('/me/avatar', authenticateToken, async (req, res) => {
  const sid = req.headers['sid']
  const sql = 'SELECT `img` FROM `member` WHERE `sid`=?'
  const [result] = await db.query(sql, [sid])
  res.json(result[0])
})

router.get('/me/:mid', authenticateToken, async (req, res) => {
  if (!req.params.mid === req.user.accountId) return res.sendStatus(403)
  const sql = `SELECT * FROM member 
  WHERE sid=?`
  const [rows] = await db.query(sql, [req.params.mid])
  const avatarFileName = rows[0].img

  const imgOutput = Buffer.from(avatarFileName).toString('base64')
  console.log('imgOutput', imgOutput)
  if (rows && rows.length) {
    res.json(rows[0])
    // res.send({ imgOutput })
  } else {
    res.json({ msg: 'no data' })
  }
})

router.get('/api', async (req, res) => {
  res.json(await getListData(req, res))
})

module.exports = router
