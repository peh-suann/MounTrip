const mysql = require('mysql2');
const pool = mysql.createPool({
  host: "localhost",
  //   port: "8081",
  user: "root",
  password: "",
  database: "projmount",
  waitForConnections: true,
  connectionLimit: 5, //最多五人同時連線
  queueLimit: 0,
})

module.exports = pool.promise();