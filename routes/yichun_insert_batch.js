const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

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

const getListData = async (req, res) => {
  try {
    let rows
    let sql
    for (let i = 0; i < location_cn.length; i++) {
      for (let j = 0; j < 3; j++) {
        sql = `INSERT INTO batch (trail_sid, batch_start, batch_end) 
        VALUES (
          (SELECT sid FROM trails WHERE geo_location_sid = '${location_cn[i]}' ORDER BY RAND() LIMIT 1), 
          '2023-03-28', 
          DATE_ADD('2023-03-28', INTERVAL FLOOR(RAND() * 5) + 1 DAY)
        );`
        rows = await db.query(sql)
      }
    }
    return rows
  } catch (error) {
    console.error(error)
    return 'failed'
  }
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
