
const express = require('express')
const moment = require('moment')
const db = require('../modules/db_connection')
const router = express.Router()
const { faker } = require('@faker-js/faker')

router.use((req, res, next) => {
  next()
})

//用來抓trail_sid相同的資料
const getBatchData = async (req, res) => {
  let rows = []
  const sql = 'SELECT * FROM `batch` WHERE 1 ORDER BY `trail_sid` ASC '
  rows = await db.query(sql)

  return { rows }
}

const getTrailsData = async (req, res) => {
  let rows = []
  const sql = 'SELECT * FROM `trails` WHERE 1 ORDER BY trail_time DESC '
  rows = await db.query(sql)

  return { rows }
}

async function getBatchDate() {
  //生成起始日期的假資料
  let date = []
  date = faker.date.betweens('2023-01-01', '2024-01-01', 1)

  const randomDateStart = date.map((v, i) => {
    return moment(v).format('YYYY-MM-DD')
  })

  //將資料更新至mySQL
  //   let {batch_start} =
  //   const sqlUpdate = 'UPDATE `batch` SET `batch_start`=?'
  //   const [result] = await db.query(sqlUpdate, [batch_start])
  //   console.log(randomDateStart)
  return randomDateStart
}

router.get('/api', async (req, res) => {
  const output = await getBatchDate(req, res)
  res.json(output)
})
router.get('/api/batch', async (req, res) => {
  const output = await getBatchData(req, res)
  res.json(output)
})
router.get('/api/trails', async (req, res) => {
  const output = await getTrailsData(req, res)
  res.json(output)
})

//用來上傳batch資料的路由
router.get('/api/mix', async (req, res) => {
  //把trails的某些資料搬到batch裏面
  const trails = await getTrailsData(req, res)
  const [data, ...rest] = trails.rows

  //調整trails資料庫的時間顯示方式，並轉換成dataArray陣列
  const dataArray = data.map((v, i) => {
    const hour = Math.ceil(v.trail_time)
    return {
      sid: v.sid,
      hours: hour,
    }
  })

  //要新增到batch的資料都進到這個array裡面了
  const batchDataArray = dataArray.map((v, i) => {
    let randomDate = faker.date.between('2023-01-01', '2024-01-01')
    //設定起始日期格式
    randomDate = moment(randomDate).format('YYYY-MM-DD')
    const startDate = new Date(randomDate)

    //根據行程hours設定總行程需要幾天，tripDays=0 -> 1天
    let tripDays = Math.floor(v.hours / 24)
    //結束日期 = （起始日＋行程日）轉換為日期
    let endDate = startDate.setDate(startDate.getDate() + tripDays)
    //設定結束日期的格式
    endDate = moment(endDate).format('YYYY-MM-DD')
    // console.log(randomDate, endDate)
    return {
      related_trail: v.sid,
      batch_start: randomDate,
      batch_end: endDate,
      batch_time: v.hours,
    }
  })

  const sql_batch =
    'INSERT INTO `batch`(`trail_sid`,`batch_start`,`batch_end`,`batch_min`,`batch_max`) VALUES (?,?,?,?,?)'
  const sql_people =
    'SELECT `sid`, `trail_sid`, `batch_max` FROM `batch` WHERE 1 ORDER BY trail_sid DESC'
  //batch資料庫內已經有的資料
  let people = []
  people = await db.query(sql_people)
  const [sid, trail_sid, batch_max] = people[0]

  //   console.log('here', people_trail_id)
  //本次要新增的資料筆數，基本上筆數==trails的商品總數
  const dataNum = batchDataArray.length
  //生產資料用的迴圈，實際填入資料
  for (let i = 0; i < dataNum; i++) {
    const people = Math.ceil(Math.random() * 10)
    const [result] = await db.query(sql_batch, [
      batchDataArray[i].related_trail,
      batchDataArray[i].batch_start,
      batchDataArray[i].batch_end,
      2,
      people,
    ])
  }
})

//用來把batch資料的batch_max屬性依照trail_sid整理的路由
router.get(
  '/api/batch-max',
  async (req, res) => {
    const batch = await getBatchData(req, res)
    const [data, ...rest] = batch.rows

    const matchTrail = data.reduce((acc, { trail_sid, ...rest }) => {
      if (!acc[trail_sid]) {
        acc[trail_sid] = []
      }
      acc[trail_sid].push(rest)
      return acc
    }, {})

    //更改值的回圈
    for (let i = 1; i <= 200; i++) {
      const first = matchTrail[i][0]['batch_max']
      const first_sid = matchTrail[i][0]['sid']
      const later = matchTrail[i][1]['batch_max']
      const later_sid = matchTrail[i][1]['sid']

      const sql = `UPDATE \`batch\` SET \`batch_max\`=? WHERE sid=${later_sid}`
      const [result] = await db.query(sql, [first])
      //   destructure寫法
      //   const {i{}} = matchTrail
    }

    // console.log(matchTrail.'199')
    //   for (let i = 0; i < 200; i++) {
    //     const sameTrail = data.filter(({ trail_sid }) => trail_sid === i + 1)

    //     return
  }

  //   console.log('same', sameTrail)
)
//修正不合理的batch_max數字
router.get('/api/fix-max', async (req, res) => {
  const batch = await getBatchData(req, res)
  const [data, ...rest] = batch.rows

  for (let i = 0; i < 400; i++) {
    const max = Math.ceil(Math.random() * 10)
    if (data[i]['batch_max'] < 4) {
      const sql = `UPDATE \`batch\` SET \`batch_max\`=? WHERE sid=${data[i]['sid']}`
      const [result] = await db.query(sql, [4])
    }
  }
})
// {'199': [
//     {
//       sid: 214,
//       batch_start: 2023-02-11T16:00:00.000Z,
//       batch_end: 2023-02-11T16:00:00.000Z,
//       batch_min: 2,
//       batch_max: 7,
//       batch_sold: 0,
//       batch_switch: 1,
//       season_coupon: 1
//     },
//     {
//       sid: 14,
//       batch_start: 2023-01-08T16:00:00.000Z,
//       batch_end: 2023-01-08T16:00:00.000Z,
//       batch_min: 2,
//       batch_max: 5,
//       batch_sold: 0,
//       batch_switch: 1,
//       season_coupon: 1
//     }
//   ],
//   '200': [
//     {
//       sid: 169,
//       batch_start: 2023-10-04T16:00:00.000Z,
//       batch_end: 2023-10-04T16:00:00.000Z,
//       batch_min: 2,
//       batch_max: 9,
//       batch_sold: 0,
//       batch_switch: 1,
//       season_coupon: 1
//     },
//     {
//       sid: 369,
//       batch_start: 2023-08-11T16:00:00.000Z,
//       batch_end: 2023-08-11T16:00:00.000Z,
//       batch_min: 2,
//       batch_max: 4,
//       batch_sold: 0,
//       batch_switch: 1,
//       season_coupon: 1
//     }
//   ]
// }

router.get('/reduce', async (req, res) => {
  const data = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Mary', age: 25 },
    { id: 3, name: 'Peter', age: 40 },
    { id: 4, name: 'Mary', age: 35 },
  ]

  const groupedData = data.reduce((acc, { name, ...rest }) => {
    if (!acc[name]) {
      acc[name] = []
    }
    acc[name].push(rest)
    return acc
  }, {})
  //groupedData:是物件
  // {
  //     John: [ { id: 1, age: 30 } ],
  //     Mary: [ { id: 2, age: 25 }, { id: 4, age: 35 } ],
  //     Peter: [ { id: 3, age: 40 } ]
  //   }
  console.log('GD:', groupedData)
})

router.get('/', async (req, res) => {
  res.json() //呈現list表單
})

module.exports = router
