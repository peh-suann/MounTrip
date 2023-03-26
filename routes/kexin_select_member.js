const express = require('express')
const db = require('./../modules/db_connection')

const router = express.Router()

// router.use((req, res, next) => {
//   next()
// })

const getListData = async (req, res) => {
  let sid = req.query.sid || 1
  console.log(sid)
  const sql = `SELECT img FROM member WHERE sid=${sid}`

  console.log(sql)
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
