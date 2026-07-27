const twilio = require("twilio");

const client = twilio(

  process.env.TWILIO_ACCOUNT_SID,

  process.env.TWILIO_AUTH_TOKEN

);

const sendWhatsApp = async (to, message) => {

  try {

    const response = await client.messages.create({

      body: message,

      from: process.env.TWILIO_WHATSAPP_NUMBER,

      to: `whatsapp:+91${to}`

    });

    console.log("✅ WhatsApp Sent:", response.sid);

  } catch (err) {

    console.log("❌ WhatsApp Error:", err.message);

  }

};

module.exports = sendWhatsApp;