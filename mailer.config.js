const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: process.env.host,
  port: Number(process.env.port),
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

//send email for verification
const sendConfirmationEmail = (username, email, confirmationCode) => {
  transport
    .sendMail({
      from: "account@blogify.com",
      to: email,
      subject: "Please confirm your Blogify account",
      html: `<h2 style="color: green; text-align: center">Email Confirmation</h2>
        <h3>Hello ${username},</h3>
        <p>Thank you for registering on our website. Please confirm your email by clicking on the following link</p>
        <a href=${process.env.APP_URL}/auth/confirm-email/${confirmationCode}> Click here</a>
        <br />
        <br />
        <p>If you couldn't click on the link above, then copy and paste the below link into your browser.</p>
        <a href=${process.env.APP_URL}/auth/confirm-email/${confirmationCode}> ${process.env.APP_URL}/auth/confirm-email/${confirmationCode}</a>
        </div>`,
    })
    .catch((err) => console.log(err));
};

//send welcome email
const sendWelcomeEmail = (username, email) => {
  transport
    .sendMail({
      from: "hello@blogify.com",
      to: email,
      subject: "Welcome to Blogify",
      html: `<h2>We are happy to have you signed up with Blogify!</h2>
        <h3>Hello ${username},</h3>
        <p>Thank you for registering on our website. You account has now been verified, and we are looking forward to reading your posts.</p>
        <br />
        <br />
        <br />
        <p>Thanks,</p>
        <p>Blogify Team.</p>
        </div>`,
    })
    .catch((err) => console.log(err));
};

//send password reset email
const sendPasswordResetEmail = (username, email, confirmationCode) => {
  transport
    .sendMail({
      from: "account@blogify.com",
      to: email,
      subject: "Password Reset Request for your Blogify account",
      html: `<h2>Reset your Blogify Password</h2>
        <h3>Hello ${username},</h3>
        <p>We received a request that you want to reset your password. </p>
        <p>If this request was made in error, then ignore this email, else, click on the link below, and we will send you a new auto-generated password. </p>
        <a href=${process.env.APP_URL}/auth/password-reset/${confirmationCode}> Click here</a>
        <br />
        <br />
        <p>If you couldn't click on the link above, then copy and paste the below link into your browser.</p>
        <a href=${process.env.APP_URL}/auth/new-password/${confirmationCode}> ${process.env.APP_URL}/auth/password-reset/${confirmationCode}</a>
        </div>`,
    })
    .catch((err) => console.log(err));
};

const sendNewPassword = (username, email, pass) => {
  transport
    .sendMail({
      from: "account@blogify.com",
      to: email,
      subject: "Your New Blogify Detail",
      html: `<h2>Find your new Blogify pass below!</h2>
        <h3>Hello ${username},</h3>
        <p>Your new password is: ${pass}</p>
        <p>Please make sure to change it once you login. </p>
        <br />
        <br />
        <p>Thanks,</p>
        <p>Blogify Team.</p>
        </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports = {
  sendWelcomeEmail,
  sendConfirmationEmail,
  sendNewPassword,
  sendPasswordResetEmail,
};

// <a href=${process.env.APP_URL}/api/auth/confirmEmail/${confirmationCode}> Click here</a>
