const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  try {
    let rows
    let sql
    for (let i = 572; i <= 629; i++) {
      // sql = `
      //  INSERT INTO order_detail (order_sid, batch_sid, amount, create_date, fake_delete)
      //  VALUES (03${i}, ${i}, 1, CURDATE(), 0);`
      sql = `
       INSERT INTO order_list (sid, order_date, member_sid)
       VALUES (03${i}, NOW(), (SELECT sid FROM member ORDER BY RAND() LIMIT 1));`
      rows = await db.query(sql)
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
