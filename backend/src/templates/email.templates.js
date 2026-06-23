/**
 * LMS Email Templates
 * Premium HTML email templates with inline CSS for maximum compatibility
 */

const BRAND = {
  name: 'UptoSkills',
  tagline: "Let's Make Freshers Employable!",
  color: '#6366f1',       // Primary indigo
  colorDark: '#4f46e5',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
  bgDark: '#0f172a',
  bgCard: '#1e293b',
  textLight: '#e2e8f0',
  textMuted: '#94a3b8',
  border: '#334155',
};

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UptoSkills LMS</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgDark};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bgDark};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:${BRAND.color};">Upto</span><span style="color:#06b6d4;">Skills</span>
              </div>
              <div style="font-size:11px;color:${BRAND.textMuted};letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;">
                ${BRAND.tagline}
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:${BRAND.bgCard};border-radius:16px;border:1px solid ${BRAND.border};overflow:hidden;">
              
              <!-- Gradient Top Bar -->
              <div style="height:4px;background:${BRAND.gradient};"></div>
              
              <!-- Content -->
              <div style="padding:40px 36px;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
                This email was sent by UptoSkills LMS.<br/>
                If you didn't request this, you can safely ignore it.
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#475569;">
                © ${new Date().getFullYear()} UptoSkills. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Email Verification OTP
 */
const verifyEmailOTP = (userName, otp) => {
  const html = baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f8fafc;">
      Verify Your Email
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Hi <strong style="color:${BRAND.textLight};">${userName}</strong>, welcome to UptoSkills! 
      Use the code below to verify your email address.
    </p>

    <!-- OTP Box -->
    <div style="text-align:center;margin:0 0 28px;">
      <div style="display:inline-block;background:${BRAND.bgDark};border:2px solid ${BRAND.color};border-radius:12px;padding:20px 40px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#f8fafc;font-family:'Courier New',monospace;">
          ${otp}
        </span>
      </div>
    </div>

    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};">
      ⏱ This code expires in <strong style="color:${BRAND.textLight};">15 minutes</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">
      🔒 Never share this code with anyone.
    </p>

    <!-- Divider -->
    <div style="border-top:1px solid ${BRAND.border};margin:28px 0 20px;"></div>

    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
      If you didn't create an account on UptoSkills, please ignore this email.
    </p>
  `);

  const text = `Hi ${userName}, your UptoSkills verification code is: ${otp}. This code expires in 15 minutes.`;
  
  return { html, text };
};

/**
 * Password Reset OTP
 */
const passwordResetOTP = (userName, otp) => {
  const html = baseLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f8fafc;">
      Reset Your Password
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Hi <strong style="color:${BRAND.textLight};">${userName}</strong>, 
      we received a request to reset your password. Use the code below to proceed.
    </p>

    <!-- OTP Box -->
    <div style="text-align:center;margin:0 0 28px;">
      <div style="display:inline-block;background:${BRAND.bgDark};border:2px solid #f59e0b;border-radius:12px;padding:20px 40px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#f8fafc;font-family:'Courier New',monospace;">
          ${otp}
        </span>
      </div>
    </div>

    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};">
      ⏱ This code expires in <strong style="color:${BRAND.textLight};">15 minutes</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">
      🔒 If you didn't request a password reset, ignore this email. Your password will remain unchanged.
    </p>

    <!-- Divider -->
    <div style="border-top:1px solid ${BRAND.border};margin:28px 0 20px;"></div>

    <!-- Security Notice -->
    <div style="background:#7c2d1220;border:1px solid #7c2d1250;border-radius:8px;padding:12px 16px;">
      <p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.5;">
        ⚠️ <strong>Security Notice:</strong> UptoSkills will never ask you for your password via email or phone.
      </p>
    </div>
  `);

  const text = `Hi ${userName}, your UptoSkills password reset code is: ${otp}. This code expires in 15 minutes. If you didn't request this, ignore this email.`;
  
  return { html, text };
};

/**
 * Password Reset Success
 */
const passwordResetSuccess = (userName) => {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:#10b98120;font-size:32px;">
        ✅
      </div>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f8fafc;text-align:center;">
      Password Changed Successfully
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;text-align:center;">
      Hi <strong style="color:${BRAND.textLight};">${userName}</strong>, 
      your password has been updated. You can now sign in with your new password.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:0 0 28px;">
      <a href="http://localhost:3000/login" style="display:inline-block;background:${BRAND.gradient};color:white;font-weight:600;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Sign In Now →
      </a>
    </div>

    <!-- Divider -->
    <div style="border-top:1px solid ${BRAND.border};margin:28px 0 20px;"></div>

    <div style="background:#7c2d1220;border:1px solid #7c2d1250;border-radius:8px;padding:12px 16px;">
      <p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.5;">
        ⚠️ If you didn't make this change, please reset your password immediately or contact support.
      </p>
    </div>
  `);

  const text = `Hi ${userName}, your UptoSkills password has been changed successfully. If you didn't make this change, please contact support immediately.`;
  
  return { html, text };
};

/**
 * Welcome Email (sent after verification)
 */
const welcomeEmail = (userName) => {
  const html = baseLayout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:#6366f120;font-size:32px;">
        🎉
      </div>
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f8fafc;text-align:center;">
      Welcome to UptoSkills!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;text-align:center;">
      Hey <strong style="color:${BRAND.textLight};">${userName}</strong>, 
      your email is verified and your account is ready. Start your learning journey now!
    </p>

    <!-- Features Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:8px;" width="50%">
          <div style="background:${BRAND.bgDark};border:1px solid ${BRAND.border};border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">📚</div>
            <div style="font-size:13px;font-weight:600;color:${BRAND.textLight};">9+ Courses</div>
            <div style="font-size:11px;color:${BRAND.textMuted};">AI, Web Dev & More</div>
          </div>
        </td>
        <td style="padding:8px;" width="50%">
          <div style="background:${BRAND.bgDark};border:1px solid ${BRAND.border};border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">🏆</div>
            <div style="font-size:13px;font-weight:600;color:${BRAND.textLight};">Certificates</div>
            <div style="font-size:11px;color:${BRAND.textMuted};">Earn & Showcase</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:8px;" width="50%">
          <div style="background:${BRAND.bgDark};border:1px solid ${BRAND.border};border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">🎯</div>
            <div style="font-size:13px;font-weight:600;color:${BRAND.textLight};">Learning Paths</div>
            <div style="font-size:11px;color:${BRAND.textMuted};">Structured Growth</div>
          </div>
        </td>
        <td style="padding:8px;" width="50%">
          <div style="background:${BRAND.bgDark};border:1px solid ${BRAND.border};border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">⚡</div>
            <div style="font-size:13px;font-weight:600;color:${BRAND.textLight};">XP & Streaks</div>
            <div style="font-size:11px;color:${BRAND.textMuted};">Stay Motivated</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <div style="text-align:center;">
      <a href="http://localhost:3000" style="display:inline-block;background:${BRAND.gradient};color:white;font-weight:600;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Explore Courses →
      </a>
    </div>
  `);

  const text = `Welcome to UptoSkills, ${userName}! Your email is verified and your account is ready. Start exploring courses at http://localhost:3000`;
  
  return { html, text };
};

module.exports = {
  verifyEmailOTP,
  passwordResetOTP,
  passwordResetSuccess,
  welcomeEmail,
};
