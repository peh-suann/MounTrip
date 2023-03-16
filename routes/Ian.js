const express = require('express')
const db = require('../modules/db_connection')

const router = express.Router()

const getdifficultyDataHard = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=3 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getdifficultyDataMedium = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=2 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getdifficultyDataEasy = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,difficulty_list.difficulty_short,trails.trail_img,trails.trail_name,trails.geo_location_sid,trails.geo_location_town_sid,trails.price FROM `trails` INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid WHERE difficulty_list_sid=1 ORDER BY RAND() LIMIT 6'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonData = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT rating.score,trails.trail_name,trails.trail_img,trails.geo_location_sid,trails.geo_location_town_sid,trails.price,difficulty_list.difficulty_short FROM trails INNER JOIN difficulty_list ON trails.difficulty_list_sid=difficulty_list.sid INNER JOIN rating ON rating.trails_sid=trails.sid ORDER BY RAND() LIMIT 9;'
  )
  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSeasonComment = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT member.sid,member.firstname,member.lastname,rating_img,rating.comment,rating.rate_date FROM rating INNER JOIN member on rating.member_sid=member.sid WHERE rating.score=5 ORDER BY RAND()'
  )

  const rows = Rows[0]
  // res.json(rows)
  // console.log({ rows })
  return { rows }
}

const getSCData = async (req, res) => {
  let Rows = []
  Rows = await db.query(
    'SELECT trails.trail_name,trails.trail_img,trails.price,batch.batch_start,batch.batch_end FROM trails JOIN batch ON trails.sid=batch.trail_sid WHERE batch.trail_sid=160 OR batch.trail_sid=26'
  )
  const rows = Rows[0]
  return { rows }
}

// router.get('/difficulty', async (req, res) => {
//   let data = []
//   switch (req.query.level) {
//     case '3':
//       break
//     default:
//       data = await getdifficultyDataEasy(req, res)
//   }
//   res.json(data)
// })
router.get('/difficultyHard', async (req, res) => {
  const hard = await getdifficultyDataHard(req, res)
  res.json(hard)
  // console.log(output)
})

router.get('/difficultyMedium', async (req, res) => {
  const medium = await getdifficultyDataMedium(req, res)
  res.json(medium)

  // console.log(output)
})

router.get('/difficultyEasy', async (req, res) => {
  const easy = await getdifficultyDataEasy(req, res)
  res.json(easy)

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

router.get('/sc1', async (req, res) => {
  const data = await getSCData(req, res)
  res.json(data)
})

module.exports = router
