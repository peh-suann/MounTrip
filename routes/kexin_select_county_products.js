const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

// router.use((req, res, next) => {
//   next()
// })

const getListData = async (req, res) => {
  console.log(decodeURIComponent(req.query.county), req.query.keyword)
  let county = decodeURIComponent(req.query.county) || '新北市'
  let keyword = req.query.keyword || ''

  console.log(county, keyword)
  const sql = `SELECT COUNT(*) AS count, trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid , trails.trail_img, trails.trail_describ, trails.trail_time, trails.trail_length, trails.trail_height,trails.lon, trails.lat, difficulty_list.difficulty_short, batch.sid AS batch_sid, batch.batch_start, batch.batch_end, ( SELECT AVG(rating.score) FROM rating WHERE rating.batch_sid = order_detail.batch_sid ) as avg_score FROM order_detail JOIN batch ON order_detail.batch_sid = batch.sid JOIN trails ON trails.sid = batch.trail_sid JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trails.geo_location_sid = '${county}' AND trails.trail_describ LIKE '%${keyword}%' AND trails.trail_name LIKE '%${keyword}%' GROUP BY trails.sid ORDER BY count DESC LIMIT 7;`
 
  const rows = await db.query(sql)
  //   console.log('rows', rows)
  return rows[0]
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
  // res.send('<h2>admin2</h2>')
})

module.exports = router
