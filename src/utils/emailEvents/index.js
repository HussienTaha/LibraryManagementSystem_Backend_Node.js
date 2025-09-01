 import { EventEmitter } from "events";
// import { sendEmail } from "../../service/sendemail.js";
import  jwt  from "jsonwebtoken";
import { sendEmail } from "../../service/sendEmail.js";
// import { sendEmail } from "/../service/sendEmail.js";
 export const eventEmitter = new EventEmitter();
 eventEmitter.on("sendEmail",async(data)=>{
    const {email}=data

       const token = jwt.sign({ email }, process.env.SIGNTURE, { expiresIn: "3m" });
    const link = `http://localhost:3000/users/confirmemail/${token}`;
       

    const isSend = await sendEmail({
      to: email,
      subject: "Confirm Email",
      html: `
<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <h2 style="color: #2c3e50; text-align: center;">📚 أهلاً بك في مكتبتنا الرقمية</h2>

    <!-- Intro -->
    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      سعداء بانضمامك لرحلة المعرفة. منصتنا بتوفرلك آلاف الكتب والمراجع علشان تلاقي كل اللي محتاجه في مكان واحد.
    </p>

    <!-- Features -->
    <ul style="font-size: 15px; color: #555; line-height: 1.8;">
      <li>📖 وصول سريع وسهل إلى الكتب الرقمية.</li>
      <li>🔍 بحث ذكي علشان توصل للمعلومة أسرع.</li>
      <li>🔒 بياناتك دايمًا في أمان وخصوصيتك محمية.</li>
    </ul>

    <!-- CTA Button -->
    <p style="font-size: 16px; color: #555; margin-top: 20px;">
      اضغط على الزر التالي علشان تفعل حسابك وتبدأ رحلة القراءة:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" style="background-color: #3498db; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
        ✅ تفعيل حسابي
      </a>
    </div>

    <!-- Footer -->
    <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
    <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 15px;">
      © 2025 مكتبتك الرقمية – كل الحقوق محفوظة
    </p>
  </div>
</div>

`,
    });

    if (!isSend) {
      return res
        .status(500)
        .json({
          message: "Failed to send email",
          message: error.message,
          error,
        });
    }


   eventEmitter.on("forgetPassword", async (data) => {

  
    const {email,otp} =data
   const send= await sendEmail({
      to: email,
      subject: "🔐 Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 500px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">🔐 Verification Code</h2>
            <p style="font-size: 16px; color: #555;">Hello <strong>${email}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              Here is your One-Time Password (OTP) to reset your password:
            </p>
            <div style="font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0; color: #1a73e8;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #999;">
              This code will expire in 2 minutes. Please do not share it with anyone.
            </p>
            <p style="font-size: 14px; color: #777;">Thank you,<br/>Your App Team</p>
          </div>
        </div>
      `
    });
   
    if( !send )
    console.error("❌ Error sending OTP email:", err);
 
});


 })

