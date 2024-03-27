const nodemailer = require('nodemailer');

let mailer = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
	auth: {
		user: "",
        pass: ""
    }
})

exports.posaljiMail = async function(salje, prima, predmet, poruka){
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if(!emailRegex.test(prima)){
		console.log("E-mail nije poslan zbog nevaljane adrese primatelja: "+prima);
		return false;
	}
	message = {
		from: salje,
		to: prima,
		subject: predmet,
		text: poruka
	}
	let odgovor = await mailer.sendMail(message);
	console.log(odgovor);
	return odgovor;
}
