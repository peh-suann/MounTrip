const express = require('express');
const session = require('express-session');
const MysqlStore = require("express-mysql-session")(session);
const Jimp = require('Jimp');
const moment = require('moment-timezone')
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

//DB連接
const db = require('./modules/db_connection')
const sessionStore = new MysqlStore({},db); //一定要給的連線設定

//首頁
app.get('/',(req,res)=>{
    res.send('<h1>MounTrip首頁</h1>');
})





//404頁面
app.use((req,res)=>{
    res
        .status(404)
        .send(`
        <h1>找不到此頁面</h1>
        <h2>山林知識：在山上迷路要原地等待救援</h2>
        `)
})

const port = process.env.PORT || 3000;;
app.listen(port,()=>{
    console.log(`伺服器啟動:${port}`);

})