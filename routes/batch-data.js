const express = require('express')
const db = require('../modules/db_connection')

const router = express.Router()

const getdifficultyData = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT trails.difficulty_list_sid,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` WHERE difficulty_list_sid=3 LIMIT 6;'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonData = async (req, res) => {
  let Rows = []
  Rows = await db.query('SELECT * FROM trails LIMIT 9')
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonComment = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT member.sid,member.firstname,member.lastname,trails.trail_img,rating.comment,rating.rate_date FROM rating INNER JOIN member on rating.member_sid=member.sid INNER JOIN trails ON trails.sid=rating.trails_sid WHERE rating.trails_sid=16 LIMIT 4'
  )

  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

router.get('/difficulty', async (req, res) => {
  const output = await getdifficultyData(req, res)
  res.json(output)
  // console.log(output)
})

router.get('/season', async (req, res) => {
  const output = await getSeasonData(req, res)
  res.json(output)
  // console.log(output)
})

router.get('/seasonComment', async (req, res) => {
  const data = await getSeasonComment(req, res)
  res.json(data)
  // console.log(output)
})

module.exports = router
