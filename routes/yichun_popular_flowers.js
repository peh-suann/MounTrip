const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  const sql =
    "SELECT COUNT(*) AS count, trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid AS trails_sid,batch_sid, trails.trail_img, difficulty_list.difficulty_short FROM order_detail JOIN batch ON order_detail.batch_sid = batch.sid JOIN trails ON trails.sid = batch.trail_sid JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trail_describ LIKE '%花%' GROUP BY batch_sid ORDER BY count DESC LIMIT 6;"
  const rows = await db.query(sql)
  return rows[0]
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
