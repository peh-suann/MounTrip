const express = require('express')
const db = require('../modules/db_connection')
const router = express.Router()

router.use((req, res, next) => {
  next()
})

// 篩選呈現用
const getListData = async (req, res) => {
  let redirect = ''
  // const perPage = 1
  const perPage = 6
  let page = +req.query.page || 1

  let sqlWhere = ' WHERE 1 ' // 條件式的開頭

  let rows = []

  page = parseInt(page)

  if (page < 1) {
    redirect = req.baseUrl // 設定要轉向的 URL
  }
  // 算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT(1) totalRows FROM trails ${sqlWhere} `
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

  difficulty_list.difficulty_describ, difficulty_list.difficulty_short

  FROM trails 

  JOIN difficulty_list
  ON trails.difficulty_list_sid=difficulty_list.sid


  ORDER BY trails.sid 
  LIMIT ${(page - 1) * perPage}, ${perPage}
  `

    ;[rows] = await db.query(sql)
  }

  // return res.send(sql); //SQL 除錯方式

  return {
    totalRows,
    totalPages,
    perPage,
    page,
    rows,
    redirect,
  }
}

router.get('/', async (req, res) => {
  const output = await getListData(req, res)
  if (output.redirect) {
    return res.redirect(output.redirect)
  }
  res.json(output) //呈現list表單
})

// 篩選搜尋用
const getAllData = async (req, res) => {
  let redirect = ''
  const perPage = 200
  let page = +req.query.page || 1

  let sqlWhere = ' WHERE 1 ' // 條件式的開頭

  let rows = []

  page = parseInt(page)

  if (page < 1) {
    redirect = req.baseUrl // 設定要轉向的 URL
  }
  // 算總筆數
  const [[{ totalRows }]] = await db.query(
    `SELECT COUNT(1) totalRows FROM trails ${sqlWhere} `
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

  difficulty_list.difficulty_describ, difficulty_list.difficulty_short

  FROM trails 

  JOIN difficulty_list
  ON trails.difficulty_list_sid=difficulty_list.sid


  ORDER BY trails.sid 
  LIMIT ${(page - 1) * perPage}, ${perPage}
  `

    ;[rows] = await db.query(sql)
  }

  router.get('/all', async (req, res) => {
    const output = await getAllData(req, res)
    if (output.redirect) {
      return res.redirect(output.redirect)
    }
    res.json(output) //呈現list表單
  })

  // return res.send(sql); //SQL 除錯方式

  return {
    totalRows,
    totalPages,
    perPage,
    page,
    rows,
    redirect,
  }
}

// router.get('/api', async (req, res) => {
//   res.json(await getListData(req, res))
// })

module.exports = router
