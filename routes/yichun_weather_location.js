const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

let popular_location = {
  新北市: {},
  桃園市: {},
  臺北市: {},
  臺中市: {},
  臺南市: {},
  高雄市: {},
  新竹縣: {},
  苗栗縣: {},
  彰化縣: {},
  南投縣: {},
  雲林縣: {},
  嘉義縣: {},
  屏東縣: {},
  宜蘭縣: {},
  花蓮縣: {},
  臺東縣: {},
  基隆市: {},
  新竹市: {},
  嘉義市: {},
}

const location_cn = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '基隆市',
  '新竹市',
  '嘉義市',
]

const location = [
  'Taipei_City',
  'New_Taipei_City',
  'Taoyuan_City',
  'Taichung_City',
  'Tainan_City',
  'Kaohsiung_City',
  'Hsinchu_County',
  'Miaoli_County',
  'Changhua_County',
  'Nantou_County',
  'Yunlin_County',
  'Chiayi_County',
  'Pingtung_County',
  'Yilan_County',
  'Hualien_County',
  'Taitung_County',
  'Keelung_City',
  'Hsinchu_City',
  'Chiayi_City',
]

const getListData = async (req, res) => {
  try {
    for (let i = 0; i < location.length; i++) {
      const sql = `SELECT COUNT(*) AS count, trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid AS trails_sid, trails.trail_img, difficulty_list.difficulty_short, batch.sid AS batch_sid, batch.batch_start, batch.batch_end, ( SELECT AVG(rating.score) FROM rating WHERE rating.batch_sid = order_detail.batch_sid ) as avg_score FROM order_detail JOIN batch ON order_detail.batch_sid = batch.sid JOIN trails ON trails.sid = batch.trail_sid JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trails.geo_location_sid = '${location_cn[i]}' AND batch.batch_start >= CURDATE() AND batch.batch_end <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) GROUP BY trails.sid ORDER BY count DESC LIMIT 3`
      // `SELECT COUNT(*) AS count, trails.trail_name, trails.geo_location_sid, trails.geo_location_town_sid, trails.price, trails.sid AS trails_sid, trails.trail_img, difficulty_list.difficulty_short, batch.sid AS batch_sid, batch.batch_start, batch.batch_end, ( SELECT AVG(rating.score) FROM rating WHERE rating.batch_sid = order_detail.batch_sid ) as avg_score FROM order_detail JOIN batch ON order_detail.batch_sid = batch.sid JOIN trails ON trails.sid = batch.trail_sid JOIN difficulty_list ON trails.difficulty_list_sid = difficulty_list.sid WHERE trails.geo_location_sid =  '${location_cn[i]}' GROUP BY trails.sid ORDER BY count DESC LIMIT 3;`
      const rows = await db.query(sql)
      popular_location[location_cn[i]] = rows[0]
    }
  } catch (err) {
    console.error(err)
  }

  return popular_location
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
  // res.send('<h2>admin2</h2>')
})

module.exports = router
