const express = require('express')
const db = require('../modules/db_connection')
const router = express.Router()

router.use((req, res, next) => {
  next()
})

const getListData = async (req, res) => {
  let rows = []

  // const sql =`
  // SELECT * , difficulty_list.difficulty_describ, difficulty_list.difficulty_short FROM trails
  // JOIN difficulty_list
  // ON trails.difficulty_list_sid=difficulty_list.sid
  // WHERE trails.sid='3'
  // `

  const sql = `
  SELECT trails.sid, trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time, trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid, trails.coupon_status, trails.price, trails.trails_display, trails.trail_length, trails.trail_height, trails.trail_gpx , difficulty_list.difficulty_describ, difficulty_list.difficulty_short FROM trails
  JOIN difficulty_list
  ON trails.difficulty_list_sid=difficulty_list.sid
  WHERE trails.sid='3'
  `

  ;[rows] = await db.query(sql)

  // return res.send(sql); //SQL 除錯方式

  return {
    rows,
  }
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

// router.get('/api', async (req, res) => {
//   res.json(await getListData(req, res))
// })

module.exports = router
