const nodemailer = require('nodemailer');

async function simulate() {
    console.log('Generating Ethereal email test account for preview...');
    const etherealAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: etherealAccount.user,
            pass: etherealAccount.pass,
        },
    });

    const info = await transporter.sendMail({
        from: `IFRS9 System <noreply@ifrs9-app.local>`,
        to: 'imranalwi8@gmail.com',
        subject: `🔑 Reset Your Password`,
        text: `Hi Imran,\n\nWe received a request to reset your password. Please click the link below to set a new password:\n\nhttp://localhost:4231/reset-password?token=9658d2413cfe4bbf9bb3d88cdf051a366319289717778b3f6642a27291cac90d&email=imranalwi8@gmail.com\n\nIf you did not request this, please ignore this email.\nThis link will expire in 30 minutes.`,
        html: `<p>Hi <strong>Imran</strong>,</p><p>We received a request to reset your password. Please click the link below to set a new password:</p><p><a href="http://localhost:4231/reset-password?token=9658d2413cfe4bbf9bb3d88cdf051a366319289717778b3f6642a27291cac90d&email=imranalwi8@gmail.com" style="display:inline-block;padding:10px 20px;background-color:#0055FF;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a></p><p>If you did not request this, please ignore this email.<br>This link will expire in 30 minutes.</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('PREVIEW_URL=' + previewUrl);
}

simulate().catch(console.error);
