const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  const { accountId } = req.query
  const sql = `INSERT INTO member_test(member_sid, play_status) VALUES (${accountId},1)`
  const rows = await db.query(sql)
  return rows[0]
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
