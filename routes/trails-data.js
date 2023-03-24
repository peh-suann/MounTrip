const express = require('express')
const db = require('../modules/db_connection')
const router = express.Router()
const moment = require('moment-timezone')
// const { faker } = require('@faker-js/faker')

// router.use((req, res, next) => {
//   next()
// })

const getListData = async (req, res) => {
  let redirect = ''
  // const perPage = 1
  const perPage = 1
  let page = +req.query.page || 1

  let queryObj = {}
  let sqlWhere = ' WHERE 1 ' // 條件式的開頭
  let rows = []

  page = parseInt(page)

  if (page < 1) {
    redirect = req.baseUrl // 設定要轉向的 URL
  }
  // 算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT(1) totalRows FROM batch ${sqlWhere} `
  )
  const totalPages = Math.ceil(totalRows / perPage) // 總頁數

  if (totalRows > 0) {
    if (page > totalPages) {
      redirect = req.baseUrl + `?page=` + totalPages
    }

    const sql = `
    SELECT 
  
    trails.sid, trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time, 
    trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid, 
    trails.coupon_status, trails.price, trails.trails_display, 
    trails.trail_length, trails.trail_height, trails.trail_gpx , 
  
    difficulty_list.difficulty_describ, difficulty_list.difficulty_short,
  
    batch.sid,batch.trail_sid, batch.batch_start, batch.batch_end, batch.batch_min, 
    batch.batch_max, batch.batch_sold, batch.batch_switch, batch.season_coupon
  
	,COUNT(*) AS num_prods
    FROM trails 
  
    JOIN difficulty_list
    ON trails.difficulty_list_sid=difficulty_list.sid
    
    JOIN batch 
    ON trails.sid=batch.trail_sid

    GROUP BY trails.sid 
    LIMIT ${(page - 1) * perPage}, ${perPage}
    `

    //   // return res.send(sql); // SQL 除錯方式之一
    ;[rows] = await db.query(sql)
  }

  const fm = 'YYYY-MM-DD'
  rows.forEach((v) => {
    v.batch_start = moment(v.batch_start).format(fm)
    v.batch_end = moment(v.batch_end).format(fm)
    // v.rate_date = moment(v.rate_date).format(fm)
  })

  return {
    totalRows,
    totalPages,
    perPage,
    page,
    rows,
    redirect,
  }
}

// getRatingData GROUP BY

// const sql = `
// SELECT trails.sid, trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time,
//     trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid,
//     trails.coupon_status, trails.price, trails.trails_display,
//     trails.trail_length, trails.trail_height, trails.trail_gpx,

//     batch.sid,batch.trail_sid, batch.batch_start, batch.batch_end, batch.batch_min,
//     batch.batch_max, batch.batch_sold, batch.batch_switch, batch.season_coupon,

// rating.sid, rating.person, rating.member_sid, rating.trails_sid, rating.score,
// rating.rate_date, rating.comment, rating.reply,

// COUNT(*) AS num_prods
// FROM trails

// JOIN batch
// ON trails.sid=batch.trail_sid

// LEFT JOIN rating
// on rating.trails_sid=trails.sid

// GROUP BY trails.sid
// `

//----------------------------------------------------------------------------------------------------------------------------

const getRatingData = async (req, res) => {
  let rows = []
  // 用別名的方式修改
  const sql = `
  SELECT 
  rating.sid, rating.person, rating.member_sid, rating.trails_sid, rating.score, 
  rating.rate_date, rating.comment, rating.reply,
  
  member.firstname, member.lastname,

  batch.sid
  
  FROM rating

  JOIN member
  on member.sid=rating.member_sid

  JOIN batch
  on batch.sid=rating.batch_sid

    `

  // return res.send(sql); // SQL 除錯方式之一
  ;[rows] = await db.query(sql)

  const fm = 'YYYY-MM-DD'
  rows.forEach((v) => {
    v.rate_date = moment(v.rate_date).format(fm)
  })

  return {
    // totalRows,
    // totalPages,
    // perPage,
    // page,
    rows,
    // redirect,
  }
}

// async function changePrice() {
//   let price
//   // if(price === 500){
//   function getRandomInt(max = 300) {
//     return Math.floor(Math.random() * Math.floor(max - 50) + 500)
//   }
//   price = getRandomInt(price)
//   // }

//   const sqlUpdate =
//     'UPDATE `trails` SET `price`=? WHERE `sid` = 3||`sid` = 4|| `sid` = 5|| `sid` = 6|| `sid` = 7'
//   const [result] = await db.query(sqlUpdate, price)
//   console.log([result])
//   return [result]
// }

router.get('/rating', async (req, res) => {
  const output = await getRatingData(req, res)
  res.json(output)
  // console.log(output)
})

// router.get('/price', async (req, res) => {
//   const output = await changePrice(req, res)
//   res.json(output)
//   // console.log(output)
// })

//----------------------------------------------------------------------------------------------------------------------------
const getBatchData = async (req, res) => {
  let rows = []

  const sql = `
  SELECT 
  
  trails.sid, trails.trail_name, trails.trail_img, trails.trail_describ,trails.trail_time, 
  trails.geo_location_sid, trails.geo_location_town_sid, trails.difficulty_list_sid, 
  trails.coupon_status, trails.price, trails.trails_display, 
  trails.trail_length, trails.trail_height, trails.trail_gpx , 


  batch.sid,batch.trail_sid, batch.batch_start, batch.batch_end, batch.batch_min, 
  batch.batch_max, batch.batch_sold, batch.batch_switch, batch.season_coupon
  

  FROM trails 
  
  JOIN batch 
  ON trails.sid=batch.trail_sid

  ORDER BY trails.sid

  `

  ;[rows] = await db.query(sql)

  const fm = 'YYYY-MM-DD'
  rows.forEach((v) => {
    v.batch_start = moment(v.batch_start).format(fm)
    v.batch_end = moment(v.batch_end).format(fm)
  })

  // return res.send(sql); //SQL 除錯方式

  return {
    rows,
  }
}

router.get('/batch', async (req, res) => {
  const output = await getBatchData(req, res)
  res.json(output)
  // console.log(output)
})

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

router.get('/api', async (req, res) => {
  res.json(await getListData(req, res))
})

module.exports = router
