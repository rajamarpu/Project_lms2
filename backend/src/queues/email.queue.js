const { sendEmail } = require('../services/email.service');
const { verifyEmailOTP, passwordResetOTP, passwordResetSuccess, welcomeEmail } = require('../templates/email.templates');
const logger = require('../utils/logger');

/**
 * Add an email job to send via Resend
 * Supports both legacy (plain text) and template-based emails
 * 
 * @param {Object} emailData
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} [emailData.body] - Legacy plain text body (will wrap in basic HTML)
 * @param {string} [emailData.template] - Template name: 'verify-otp', 'reset-otp', 'reset-success', 'welcome'
 * @param {Object} [emailData.data] - Template data (userName, otp, etc.)
 */
const addEmailJob = async (emailData) => {
  const { to, subject, body, template, data } = emailData;

  let html, text;

  // Use template if specified
  if (template && data) {
    switch (template) {
      case 'verify-otp': {
        const t = verifyEmailOTP(data.userName, data.otp);
        html = t.html;
        text = t.text;
        break;
      }
      case 'reset-otp': {
        const t = passwordResetOTP(data.userName, data.otp);
        html = t.html;
        text = t.text;
        break;
      }
      case 'reset-success': {
        const t = passwordResetSuccess(data.userName);
        html = t.html;
        text = t.text;
        break;
      }
      case 'welcome': {
        const t = welcomeEmail(data.userName);
        html = t.html;
        text = t.text;
        break;
      }
      default:
        logger.warn(`[EmailQueue] Unknown template: ${template}`);
        html = `<p>${body || ''}</p>`;
        text = body || '';
    }
  } else {
    // Legacy: plain text body
    html = `
      <div style="font-family:'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:12px;">
        <h2 style="color:#6366f1;margin:0 0 16px;">UptoSkills LMS</h2>
        <p style="font-size:14px;line-height:1.8;white-space:pre-line;">${body || ''}</p>
        <hr style="border:none;border-top:1px solid #334155;margin:24px 0;" />
        <p style="font-size:11px;color:#64748b;">This email was sent by UptoSkills LMS.</p>
      </div>`;
    text = body || '';
  }

  try {
    const result = await sendEmail({ to, subject, html, text });
    logger.info(`[EmailQueue] Job completed: email sent to ${to}`);
    return result;
  } catch (err) {
    logger.error(`[EmailQueue] Job failed for ${to}: ${err.message}`);
    // Don't throw - email failure shouldn't crash the request
    return { id: 'failed', error: err.message };
  }
};

module.exports = { addEmailJob };
