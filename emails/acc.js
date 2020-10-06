require("dotenv").config();
const SECRET_TOKEN = process.env.SG_APIKEY
const sgMail = require('@sendgrid/mail')
const sendgridAPIkey = SECRET_TOKEN
const myemail = SG_EMAIL

sgMail.setApiKey(sendgridAPIkey)

const sendWelcomeEmail = (email, fname, lname) =>{
    sgMail.send({
        to: email,
        from:  myemail,
        subject: 'Obrigado por funcionar!',
        text: `Bem vindo, ${fname} ${lname}. Me envie uma resposta para saber se  funcionou.`

    })
};

const sendGoodByeEmail = (email, fname, lname) =>{
    sgMail.send({
        to: email,
        from:  myemail,
        subject: 'Uma pena você ter que partir :/',
        text: `Espero poder melhorar e assim conseguir fazer com que você continue conosco, ${fname} ${lname}. Até mais!`

    })
};

const forgotPassword = (email, passwordResetToken, passwordResetExpires) =>{
    sgMail.send({
        to: email,
        from:  myemail,
        subject: 'Uma pena você ter que partir :/',
        text: `Foi solicitado uma troca de senha para o email ${email}. Caso tenha sido você, utilize esse token válido por 1h após a requisição. 
        Token : ${passwordResetToken}, Valido até : ${passwordResetExpires}. Até mais!`

    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail,
    forgotPassword
}