const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SkillSwap Hub" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send failed to:', options.email);
    console.error('❌ Error details:', error.message);
    console.error('❌ Full error:', error);
    throw error; // Rethrow so controller can handle it
  }
};

// ... (sendWelcomeEmail and sendPasswordResetEmail remain exactly as they were, 
//      but they call sendEmail which now has better logging)

// ============================================================
// 📧 WELCOME EMAIL – Registration ke baad
// ============================================================
exports.sendWelcomeEmail = async (email, name, verifyUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #10B981); padding: 12px 24px; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">SkillSwap</span>
          <span style="color: #FCD34D; font-size: 24px; font-weight: bold;">Hub</span>
        </div>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">🎉 Welcome to SkillSwap Hub, ${name || 'User'}!</h1>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          You are successfully registered at <strong>SkillSwap Hub</strong>. 
          We're excited to have you on board!
        </p>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          🚀 <strong>What's next?</strong>
        </p>
        
        <ul style="color: #475569; font-size: 16px; line-height: 1.8; padding-left: 20px; margin-bottom: 20px;">
          <li>✅ Complete your <strong>profile</strong> with your skills</li>
          <li>🔍 <strong>Explore</strong> skills in the marketplace</li>
          <li>🤝 <strong>Connect</strong> with mentors and learners</li>
          <li>📚 <strong>Learn</strong> and grow together</li>
        </ul>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          ⚠️ Please verify your email address by clicking the link below:
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" 
             style="background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            ✅ Verify Email Address
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This link expires in 24 hours.<br>
          If you didn't create this account, please ignore this email.
        </p>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 8px;">
          © ${new Date().getFullYear()} SkillSwap Hub. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    email,
    subject: '🎉 Welcome to SkillSwap Hub!',
    html,
  });
};

// ============================================================
// 🔐 FORGOT PASSWORD EMAIL
// ============================================================
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #10B981); padding: 12px 24px; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">SkillSwap</span>
          <span style="color: #FCD34D; font-size: 24px; font-weight: bold;">Hub</span>
        </div>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">🔐 Reset Your Password</h1>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          We received a request to reset your password for your <strong>SkillSwap Hub</strong> account.
        </p>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            🔑 Reset Password
          </a>
        </div>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Or copy this link into your browser:
        </p>
        
        <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 14px; color: #1e293b; word-break: break-all;">
          ${resetUrl}
        </p>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          This link expires in 10 minutes.<br>
          If you didn't request this, please ignore this email.
        </p>
        
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 8px;">
          © ${new Date().getFullYear()} SkillSwap Hub. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    email,
    subject: '🔐 Reset Your Password - SkillSwap Hub',
    html,
  });
};

