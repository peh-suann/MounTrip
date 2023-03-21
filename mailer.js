const nodemailer = require('nodemailer')


function sendMagicLinkEmail({email, token}) {

    nodemailer().sendMail({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "Reset Your Password",
        html: `<a href="http:/localhost:3000/verify?token=${token}">Click Here</a>`,
    })
}

module.exports = {
    sendMagicLinkEmail,
}