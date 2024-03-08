const formData = require('form-data');
const Mailgun = require('mailgun.js');
require("dotenv").config(); 

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'GautamPatil', key: process.env.MAILGUN_API_KEY });

/**
 * Sends a certificate email to the recipient.
 * @param {Object} cert - Certificate information.
 * @param {string} cert.name - Recipient's name.
 * @param {string} cert.email - Recipient's email address.
 * @param {string} cert._id - Certificate ID.
 * @param {string} cert.event_name - Name of the event.
 * @param {string} cert.event_date - Date of the event.
 */
function sendMail(cert) {
    const { name, email, _id, event_name, event_date } = cert;

    // Email content
    const emailContent = {
        from: "Credify <credify@mail.com>",
        to: [email],
        subject: "Credify Issued you a new Certificate!",
        text: `Get your Certificate at credify.io/${_id}`,
        html: `<h1>Hey ${name},</h1><p>Get your Certificate <a href="https://credify.io/${_id}">here</a> for ${event_name} held on ${event_date}</p>`
    };

    // Send email
    mg.messages.create('test.fymaterials.live', emailContent)
        .then(response => {
            console.log("Email sent successfully:", response);
        })
        .catch(error => {
            console.error("Error sending email:", error);
        });
}

module.exports = { sendMail };
