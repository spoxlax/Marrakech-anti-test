const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email using the configured transporter.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 */
async function sendEmail(to, subject, text, html = '') {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text, // Fallback to text if HTML not provided
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Message sent: %s', info.messageId);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send an authentication related email (e.g., Verification, Reset Password)
 * @param {string} to 
 * @param {string} type - 'VERIFICATION' | 'RESET_PASSWORD'
 * @param {object} data - Dynamic data for the email
 */
async function sendAuthEmail(to, type, data) {
    let subject = '';
    let text = '';
    
    switch (type) {
        case 'VERIFICATION':
            subject = 'Verify your account';
            text = `Your verification code is: ${data.code}`;
            break;
        case 'RESET_PASSWORD':
            subject = 'Password Reset Request';
            text = `Click here to reset your password: ${data.link}`;
            break;
        case 'WELCOME':
            subject = 'Welcome to Marrakech Travel';
            text = `Welcome ${data.name}! We are glad to have you.`;
            break;
        default:
            subject = 'Notification';
            text = JSON.stringify(data);
    }
    
    return sendEmail(to, subject, text);
}

module.exports = {
  sendEmail,
  sendAuthEmail
};
