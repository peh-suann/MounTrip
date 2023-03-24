const express = require('express')
const db = require('../modules/db_connection')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.use((req, res, next) => {
  next()
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(402)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) //有看到token但帳號密碼不正確
    req.user = user
    next()
  })
}

const getdifficultyDataHard = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=3 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getdifficultyDataMedium = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=2 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getdifficultyDataEasy = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=1 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonData = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,trails.trail_name,trails.sid,trails.trail_img,trails.geo_location_sid,trails.geo_location_town_sid,trails.price,difficulty_list.difficulty_short FROM trails INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid ORDER BY RAND() LIMIT 9;'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonComment = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT member.sid,member.firstname,member.lastname,rating_img,rating.comment,rating.rate_date FROM rating INNER JOIN member on rating.member_sid=member.sid WHERE rating.score=5 LIMIT 7'
  )

  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getCouponData = async (req, res, sid) => {
  const sql =
    'SELECT coupon.sid AS coupon_sid, coupon_code, coupon_name, start_date_coup, end_date_coup, promo_name, coupon_status,min_purchase FROM coupon JOIN member_coupon ON member_coupon.coupon_sid = coupon.sid WHERE member_coupon.member_sid =? ORDER BY coupon.sid ASC'
  const rows = await db.query(sql, sid)
  return rows[0]
}

router.get('/difficultyHard', async (req, res) => {
  const hard = await getdifficultyDataHard(req, res)
  res.json(hard)
  // console.log(output)
})

router.get('/difficultyMedium', async (req, res) => {
  const medium = await getdifficultyDataMedium(req, res)
  res.json(medium)

  // console.log(output)
})

router.get('/difficultyEasy', async (req, res) => {
  const easy = await getdifficultyDataEasy(req, res)
  res.json(easy)

  // console.log(output)
})

router.get('/season', async (req, res) => {
  const output = await getSeasonData(req, res)
  res.json(output)
  // console.log(output)
})

router.get('/seasonComment', async (req, res) => {
  const data = await getSeasonComment(req, res)
  res.json(data)
  // console.log(output)
})

router.get('/SC1', authenticateToken, async (req, res) => {
  const sid = req.headers['sid']
  console.log(sid)
  const data = await getCouponData(req, res, sid)
  res.json(data)
  // console.log(data)
})

router.get('/:mid', authenticateToken, async (req, res) => {
  if (!req.params.mid === req.user.accountId) return res.sendStatus(403)
  const sql = `SELECT * FROM member 
  WHERE sid=?`
  const [rows] = await db.query(sql, [req.params.mid])
  const bdConvert = new Date(rows[0].birthday)
  const year = bdConvert.getFullYear()
  const month = String(bdConvert.getMonth() + 1).padStart(2, '0')
  const day = String(bdConvert.getDate()).padStart(2, '0')
  const bdFormat = `${year}-${month}-${day}`
  const convertedRows = { ...rows[0], bdFormat: bdFormat }
  if (rows && rows.length) {
    res.json(convertedRows)
    // res.json(rows[0])
    // res.send({ imgOutput })
  } else {
    res.json({ msg: 'no data' })
  }
})

router.post('/history', async (req, res) => {
  console.log('req.body:', req.body)
  const sql =
    "INSERT INTO `order_list`( `order_date`, `member_sid`,`order_status_sid` ,`total`,`memo`,`fake_delete`) VALUES (now(),?,2,?,null,'1')"
  const rows = await db.query(sql, [req.body.userSid, req.body.payTotal])
  // console.log(rows)
  // res.json(rows)

  const mysql =
    'SELECT order_list.sid FROM order_list ORDER BY `order_list`.`sid` DESC LIMIT 0,1'
  const [orderList_lastSid] = await db.query(mysql)
  console.log(orderList_lastSid)
  res.json(orderList_lastSid)
})

router.post('/history2', async (req, res) => {
  console.log('req.body:', req.body)
  const sql =
    'INSERT INTO `order_detail`(`order_sid`, `batch_sid`,`amount`,`create_date`,`fake_delete`) VALUES (?,?,?,now(),0)'
  const rows = await db.query(sql, [
    req.body.lastSid,
    req.body.cartSid,
    req.body.cartQuantity,
  ])
  // console.log(rows)
  res.json(rows)
})
router.post('/orderDate', async (req, res) => {
  const sql =
    'SELECT order_date FROM order_list ORDER BY `order_list`.`sid` DESC LIMIT 0,1'
  const rows = await db.query(sql)
  console.log(rows)
  // res.json(rows)
})

module.exports = router
