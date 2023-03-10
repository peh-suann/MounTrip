const express = require('express')
const db = require('../modules/db_connection')
const router = express.Router()

router.use((req, res, next) => {
  next()
})

const getListData = async (req, res) => {
  let rows = []

  // const sql = `SELECT * FROM trails WHERE sid=''  `

  // const sql = `
  //  SELECT * FROM trails
  //  JOIN batch
  //   ON trails.sid=batch.trail_sid
  //   JOIN difficulty_list
  //   ON trails.difficulty_list_sid=difficulty_list.sid
  //   WHERE trails.sid='3'
  //   `
  const sql = `
   SELECT * FROM trails 
   JOIN batch
    ON trails.sid=batch.trail_sid
    JOIN difficulty_list
    ON trails.difficulty_list_sid=difficulty_list.sid
    WHERE trails.sid='3'
    `

  ;[rows] = await db.query(sql)

  // return res.send(sql); //SQL 除錯方式

  return {
    rows,
  }
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

// router.get('/api', async (req, res) => {
//   res.json(await getListData(req, res))
// })

module.exports = router
