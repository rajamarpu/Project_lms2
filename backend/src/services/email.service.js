const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Send an email using Brevo (Sendinblue) REST API via native fetch
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const payload = {
      sender: {
        name: 'UptoSkills LMS',
        email: env.EMAIL_FROM
      },
      to: [
        { email: to }
      ],
      subject: subject,
      htmlContent: html,
      ...(text ? { textContent: text } : {})
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      logger.error(`[Email] Failed to send to ${to}: ${JSON.stringify(responseData)}`);
      throw new Error(responseData?.message || `Email send failed with status ${response.status}`);
    }

    logger.info(`[Email] Sent to ${to} | ID: ${responseData?.messageId} | Subject: ${subject}`);
    return responseData;
  } catch (err) {
    logger.error(`[Email] Error sending to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail };
