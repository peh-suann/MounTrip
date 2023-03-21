const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

const getListData = async (req, res) => {
  for (let i = 0; i < 400; i++) {
    const sql = "INSERT INTO `rating`(`sid`) VALUES ('[value-1]')"
    const rows = await db.query(sql)
  }
  return 'insert'
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  res.json(output)
})
module.exports = router
