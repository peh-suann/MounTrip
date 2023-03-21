const mysql = require('mysql2')

const pool = mysql.createPool({
  // yichun's connection
  // host: '127.0.0.1',
<<<<<<< HEAD
=======
  // user: 'root',
  // password: '',
  // database: 'mountrip',

  host: '192.168.21.84',
  user: 'mountain',
  password: 'mountaindude55',
  database: 'mountain',

  // host: 'localhost',
  // host: '192.168.21.84',
>>>>>>> 1515bc9 (weather data)
  // user: 'root',
  // password: '',
  // database: 'mountrip',

  // host: '192.168.21.84',
  // user: 'mountain',
  // password: 'mountaindude55',

  host: '192.168.21.84',
  user: 'mountain',
  password: 'mountaindude55',
  database: 'mountain',
  // host: 'localhost',
  // user: 'root',
  // password: '',
  // database: 'mountrip_dev',

  waitForConnections: true,
  connectionLimit: 5, //最多五人同時連線
  queueLimit: 0,
})

module.exports = pool.promise()
