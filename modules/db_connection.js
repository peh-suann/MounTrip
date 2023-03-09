const mysql = require('mysql2')

const pool = mysql.createPool({
  host: '192.168.21.84',
  user: 'mountain',
  password: 'mountaindude55',
  database: 'mountain',
  waitForConnections: true,
  connectionLimit: 5, //最多五人同時連線
  queueLimit: 0,
})

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'mountrip',
//   waitForConnections: true,
//   connectionLimit: 5, //最多五人同時連線
//   queueLimit: 0,
// })

module.exports = pool.promise()
