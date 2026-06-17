const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur Resend:', error);
    throw new Error("Échec de l'envoi de l"email');
  }
}

module.exports = {
  resend,
  sendEmail,
};
