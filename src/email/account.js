import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendWelcomeMail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'fahad.ali.in@rupeek.com',
        subject: 'My first mail!',
        text: `Welcome to the app ${name}. Looking forward to give you best user experience.`
    })
}

const sendCancelMail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'fahad.ali.in@rupeek.com',
        subject: 'My first mail!',
        text: `See you later ${name}. Hope to see you back sometime soon.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancelMail
}
