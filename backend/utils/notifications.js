import nodemailer from 'nodemailer';

let smsBridgeSendSMS = null;

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildOfficialEmailTemplate = ({ title, preheader, greeting, messageLines = [], highlight = [], footerNote }) => {
  const headerTitle = escapeHtml(process.env.PORTAL_NAME || 'Public Grievance Portal');
  const bodyHtml = messageLines.map((line) => `<p style="margin:0 0 12px;color:#1f2937;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`).join('');
  const highlightHtml = highlight.length > 0
    ? `<div style="margin:18px 0 0;padding:14px 16px;background:#f8fafc;border:1px solid #dbe4f0;border-radius:10px;">
        ${highlight.map((item) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid #e5edf5;"><span style="color:#64748b;font-size:13px;">${escapeHtml(item.label)}</span><strong style="color:#0f172a;font-size:13px;text-align:right;">${escapeHtml(item.value)}</strong></div>`).join('')}
      </div>`
    : '';

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#eef3f8;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f8;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #d8e3ee;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#0f4c81 0%,#123b63 100%);padding:24px 28px;color:#fff;">
                  <div style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:.9;">Government Communication</div>
                  <div style="font-size:22px;font-weight:700;line-height:1.3;margin-top:8px;">${escapeHtml(headerTitle)}</div>
                  <div style="font-size:13px;opacity:.9;margin-top:6px;">Official Notice from the Department</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <div style="display:inline-block;background:#e8f1fb;color:#0f4c81;font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:6px 10px;border-radius:999px;">${escapeHtml(title)}</div>
                  <h1 style="margin:16px 0 14px;font-size:22px;line-height:1.4;color:#0f172a;">${escapeHtml(greeting)}</h1>
                  ${bodyHtml}
                  ${highlightHtml}
                  ${footerNote ? `<p style="margin:20px 0 0;color:#475569;font-size:13px;line-height:1.6;">${escapeHtml(footerNote)}</p>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 28px;color:#64748b;font-size:12px;line-height:1.7;border-top:1px solid #e8eef5;">
                  This is an automated message from the official grievance management system. Please do not reply to this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const buildVerificationEmailHtml = ({ code, expiryMinutes = 10 }) => buildOfficialEmailTemplate({
  title: 'Verification Code',
  preheader: 'Your verification code for the grievance portal.',
  greeting: 'Your verification code is ready',
  messageLines: [
    'Use the verification code below to complete the confirmation process for your account.',
    `The code is valid for ${expiryMinutes} minutes. For security reasons, do not share it with anyone.`
  ],
  highlight: [
    { label: 'Verification Code', value: code },
    { label: 'Validity', value: `${expiryMinutes} minutes` }
  ],
  footerNote: 'If you did not request this code, you can safely ignore this message.'
});

const getEmailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const getSmsSender = async () => {
  if (smsBridgeSendSMS !== null) {
    return smsBridgeSendSMS;
  }

  try {
    const smsBridge = await import('sms-bridge');
    smsBridgeSendSMS = smsBridge.sendSMS || smsBridge.default?.sendSMS || null;
  } catch (error) {
    smsBridgeSendSMS = null;
  }

  return smsBridgeSendSMS;
};

export const sendComplaintNotifications = async ({
  email,
  phone,
  complaintNumber,
  title,
  department,
  statusLabel,
  message,
}) => {
  const outcomes = { email: false, sms: false };

  const emailTransporter = getEmailTransporter();
  if (emailTransporter && email) {
    try {
      const html = buildOfficialEmailTemplate({
        title: statusLabel,
        preheader: message,
        greeting: `Complaint ${complaintNumber} has been updated`,
        messageLines: [
          message,
          'The latest complaint details are summarized below for your reference.'
        ],
        highlight: [
          { label: 'Complaint Number', value: complaintNumber },
          { label: 'Title', value: title },
          { label: 'Department', value: department }
        ],
        footerNote: 'You may log in to the portal at any time to review the full complaint history and progress updates.'
      });

      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `[Official Notice] ${statusLabel} - Complaint ${complaintNumber}`,
        text: `${message}\n\nComplaint Number: ${complaintNumber}\nTitle: ${title}\nDepartment: ${department}`,
        html,
      });
      outcomes.email = true;
    } catch (error) {
      console.error('Email notification failed:', error.message);
    }
  }

  const sendSMS = await getSmsSender();
  if (sendSMS && phone) {
    try {
      await sendSMS({
        to: phone,
        message: `${statusLabel}: ${message} | Ref: ${complaintNumber}`,
      });
      outcomes.sms = true;
    } catch (error) {
      console.error('SMS notification failed:', error.message);
    }
  }

  return outcomes;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getEmailTransporter();
  if (!transporter || !to) return false;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('sendEmail error:', err.message);
    return false;
  }
};

export const sendSMS = async ({ to, message }) => {
  const sendSMSFn = await getSmsSender();
  if (!sendSMSFn || !to) return false;
  try {
    await sendSMSFn({ to, message });
    return true;
  } catch (err) {
    console.error('sendSMS error:', err.message);
    return false;
  }
};

export const buildVerificationEmail = (code) => buildVerificationEmailHtml({ code, expiryMinutes: 10 });