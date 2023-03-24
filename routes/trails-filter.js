const express = require('express')
const db = require('../modules/db_connection')
const router = express.Router()
const moment = require('moment-timezone')

router.use((req, res, next) => {
  next()
})

const getListData = async (req, res) => {
  let redirect = ''
  // const perPage = 1
  const perPage = 10
  let page = +req.query.page || 1

  let sqlWhere = ' WHERE 1 ' // 條件式的開頭

  let rows = []

  page = parseInt(page)

  if (page < 1) {
    redirect = req.baseUrl // 設定要轉向的 URL
  }
  // 算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT(1) totalRows FROM trails ${sqlWhere} `
  )
  const totalPages = Math.ceil(totalRows / perPage) // 總頁數

  if (totalRows > 0) {
    if (page > totalPages) {
      redirect = req.baseUrl + `?page=` + totalPages
    }

    const sql = `
  SELECT 

  trails.sid, trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time, 
  trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid, 
  trails.coupon_status, trails.price, trails.trails_display, 
  trails.trail_length, trails.trail_height, trails.trail_gpx , 

  difficulty_list.difficulty_describ, difficulty_list.difficulty_short

  FROM trails 

  JOIN difficulty_list
  ON trails.difficulty_list_sid=difficulty_list.sid


  ORDER BY trails.sid 
  LIMIT ${(page - 1) * perPage}, ${perPage}
  `

    ;[rows] = await db.query(sql)
  }

  // return res.send(sql); //SQL 除錯方式

  return {
    totalRows,
    totalPages,
    perPage,
    page,
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

const getAllData = async (req, res) => {
  let rows = []

  const sql = `
  SELECT 

  trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time, 
  trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid, 
  trails.coupon_status, trails.price, trails.trails_display, 
  trails.trail_length, trails.trail_height, trails.trail_gpx , 

  difficulty_list.difficulty_describ, difficulty_list.difficulty_short,

  batch.sid, batch.trail_sid, batch.batch_start, batch.batch_end, batch.batch_min, 
  batch.batch_max, batch.batch_sold, batch.batch_switch, batch.season_coupon

  , COUNT(*) AS num_prods

  FROM trails 

  LEFT JOIN difficulty_list
  ON trails.difficulty_list_sid=difficulty_list.sid

  LEFT JOIN batch 
  ON trails.sid=batch.trail_sid


  GROUP BY trails.sid 

  `

  ;[rows] = await db.query(sql)

  const fm = 'YYYY-MM-DD'
  rows.forEach((v) => {
    v.batch_start = moment(v.batch_start).format(fm)
    v.batch_end = moment(v.batch_end).format(fm)
  })

  // return res.send(sql); //SQL 除錯方式

  return {
    rows,
  }
}

router.get('/all', async (req, res) => {
  const output = await getAllData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

// router.get('/api', async (req, res) => {
//   res.json(await getListData(req, res))
// })

module.exports = router
