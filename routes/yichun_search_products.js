const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  const sql = ''
  const rows = await db.query(sql)
  return rows
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})

module.exports = router
