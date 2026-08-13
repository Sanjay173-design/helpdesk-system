const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Reset your Helpdesk password',

    text: `
Hi ${name},

We received a request to reset your Helpdesk password.

Use the link below to create a new password:

${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Helpdesk Team
`.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1f2937;">
        <h2>Reset your Helpdesk password</h2>

        <p>Hi ${name},</p>

        <p>
          We received a request to reset your Helpdesk password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 10px 18px;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in 30 minutes.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <p>
          Regards,<br />
          Helpdesk Team
        </p>
      </div>
    `,
  });
};

const sendStaffInvitationEmail = async ({
  to,
  name,
  role,
  resetUrl,
}) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'You have been invited to Helpdesk',

    text: `
Hi ${name},

An administrator has created a ${role} account for you in the Helpdesk system.

Click the link below to set your password:

${resetUrl}

This invitation link will expire in 30 minutes.

If you were not expecting this invitation, please contact your administrator.

Regards,
Helpdesk Team
`.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1f2937;">

        <h2>Welcome to Helpdesk</h2>

        <p>Hi ${name},</p>

        <p>
          An administrator has created a
          <strong>${role}</strong>
          account for you in the Helpdesk system.
        </p>

        <p>
          Click the button below to set your password and activate your account:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 10px 18px;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Set Password
          </a>
        </p>

        <p>
          This invitation link will expire in 30 minutes.
        </p>

        <p>
          If you were not expecting this invitation,
          please contact your administrator.
        </p>

        <p>
          Regards,<br />
          Helpdesk Team
        </p>

      </div>
    `,
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Welcome to Helpdesk',

    text: `
Hi ${name},

Welcome to Helpdesk!

Your account has been created successfully.

You can now sign in and create support tickets.

Login:
${loginUrl}

Regards,
Helpdesk Team
`.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1f2937;">
        <h2>Welcome to Helpdesk</h2>

        <p>Hi ${name},</p>

        <p>
          Welcome to Helpdesk! Your account has been created successfully.
        </p>

        <p>
          You can now sign in and create support tickets.
        </p>

        <p>
          <a
            href="${loginUrl}"
            style="
              display: inline-block;
              padding: 10px 18px;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Login to Helpdesk
          </a>
        </p>

        <p>
          Regards,<br />
          Helpdesk Team
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendStaffInvitationEmail,
  sendWelcomeEmail,
};