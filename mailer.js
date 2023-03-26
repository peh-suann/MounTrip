//引用 nodemailer
var nodemailer = require('nodemailer')

function sendMagicLinkEmail({ email, token }) {
  //宣告發信物件
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.E_USER,
      pass: process.env.E_PASS,
    },
  })

  var options = {
    //寄件者
    from: process.env.E_USER,
    //收件者
    to: email,
    //主旨
    subject: 'Reset Your Password', // Subject line
    //嵌入 html 的內文
    html: `<a href="http://localhost:3000/password?token=${token}">Click Here</a>`,

    // TODO: 從前端get token 傳到後端驗證, 成功後再修改密碼
  }

  //發送信件方法

  transporter.sendMail(options, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('訊息發送: ' + info.response)
    }
  })
}

// function sendMagicLinkEmail({email, token}) {

//     nodemailer().sendMail({
//         to: email,
//         from: process.env.FROM_EMAIL,
//         subject: "Reset Your Password",
//         html: `<a href="http:/localhost:3000/verify?token=${token}">Click Here</a>`,
//     })
// }

module.exports = {
  sendMagicLinkEmail,
}
