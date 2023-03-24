const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  for (let i = 402; i <= 629; i++) {
    const sql = `INSERT INTO rating(sid, member_sid, batch_sid, score) VALUES ('[value-1]',1,${i}, FLOOR(4 + RAND() * 2))`
    const rows = await db.query(sql)
  }

  return 'hi'
}

// const getListData = async (req, res) => {
//   const sql = 'UPDATE `rating` SET `score`= FLOOR(4 + RAND() * 2) WHERE 1'
//   const rows = await db.query(sql)

//   return 'hi'
// }

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
