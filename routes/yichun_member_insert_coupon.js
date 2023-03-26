const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  const { accountId } = req.query
  const sql = `INSERT INTO member_coupon(coupon_sid, member_sid, status) SELECT 20, member.sid, 0 FROM member WHERE member.account = '${accountId}';`
  const rows = await db.query(sql)
  return rows[0]
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
