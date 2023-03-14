const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  const sql =
    "SELECT COUNT(*) AS count, trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid AS trails_sid, trails.trail_img, difficulty_list.difficulty_short FROM order_detail JOIN trails ON order_detail.trails_sid = trails.sid JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trails.sid IS NOT NULL AND trails.sid <> '' AND trail_describ LIKE '%溫泉%' GROUP BY order_detail.trails_sid ORDER BY count DESC LIMIT 3;"
  const rows = await db.query(sql)
  return rows[0]
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
