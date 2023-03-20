const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

// router.use((req, res, next) => {
//   next()
// })

const getListData = async (req, res) => {
  let sid = req.query.sid || 1;
  console.log(sid);
  const sql =
    `SELECT trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid, trails.trail_img, trails.trail_describ, trails.trail_time, trails.trail_length, trails.trail_height, trails.lon, trails.lat, difficulty_list.difficulty_short FROM trails JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trails.sid=${sid}`

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
