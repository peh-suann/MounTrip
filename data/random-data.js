const { faker } = require('@faker-js/faker')
// const mt = require('moment-timezone')
const moment = require('moment')
const db = require('../modules/db_connection')

function getRandomData() {
  const date = faker.date.between('2020-01-01', '2023-12-12')
  const randomName = faker.name.fullName()

  console.log(date)
  console.log(randomName)
  return {
    date: date,
    name: randomName,
  }
}
// getRandomData() //測試faker功能用的函式

async function getBatchDate() {
  //生成起始日期的假資料
  let date = []
  date = faker.date.betweens('2023-01-01', '2024-01-01', 4)

  const randomDateStart = date.map((v, i) => {
    return moment(v).format('YYYY-MM-DD')
  })
  const randomDateEnd = randomDateStart.map((v, i) => {
    // return ()
  })

  //將資料更新至mySQL
  //   let {batch_start} =
  //   const sqlUpdate = 'UPDATE `batch` SET `batch_start`=?'
  //   const [result] = await db.query(sqlUpdate, [batch_start])
  console.log(randomDateStart)
}
getBatchDate()

// async function updateSQL() {}
