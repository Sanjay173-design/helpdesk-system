const sendEmail = async ({
  to,
  toName,
  subject,
  textContent,
  htmlContent,
}) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.MAIL_FROM_NAME || 'Helpdesk',
        email: process.env.MAIL_FROM,
      },
      to: [
        {
          email: to,
          name: toName,
        },
      ],
      subject,
      textContent,
      htmlContent,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to send email';

    try {
      const errorData = await response.json();
      errorMessage =
        errorData.message ||
        errorData.code ||
        errorMessage;
    } catch {
      // Keep the default error message if Brevo doesn't return JSON.
    }

    throw new Error(errorMessage);
  }

  return response.json();
};


const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}) => {
  return sendEmail({
    to,
    toName: name,
    subject: 'Reset your Helpdesk password',

    textContent: `
Hi ${name},

We received a request to reset your Helpdesk password.

Use the link below to create a new password:

${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Helpdesk Team
`.trim(),

    htmlContent: `
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
  return sendEmail({
    to,
    toName: name,
    subject: 'You have been invited to Helpdesk',

    textContent: `
Hi ${name},

An administrator has created a ${role} account for you in the Helpdesk system.

Click the link below to set your password:

${resetUrl}

This invitation link will expire in 30 minutes.

If you were not expecting this invitation, please contact your administrator.

Regards,
Helpdesk Team
`.trim(),

    htmlContent: `
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

  return sendEmail({
    to,
    toName: name,
    subject: 'Welcome to Helpdesk',

    textContent: `
Hi ${name},

Welcome to Helpdesk!

Your account has been created successfully.

You can now sign in and create support tickets.

Login:
${loginUrl}

Regards,
Helpdesk Team
`.trim(),

    htmlContent: `
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