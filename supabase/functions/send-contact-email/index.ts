import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number; errorCodes?: string[] }> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.error("RECAPTCHA_SECRET_KEY is not set");
    return { success: false, score: 0, errorCodes: ["missing-secret-key"] };
  }

  try {
    console.log("Verifying reCAPTCHA token...");
    console.log("Secret key length:", RECAPTCHA_SECRET_KEY.length);
    console.log("Token length:", token.length);
    
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data: RecaptchaResponse = await response.json();
    console.log("reCAPTCHA full response:", JSON.stringify(data));
    
    if (!data.success && data["error-codes"]) {
      console.error("reCAPTCHA error codes:", data["error-codes"]);
    }
    
    return { 
      success: data.success, 
      score: data.score || 0,
      errorCodes: data["error-codes"]
    };
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return { success: false, score: 0, errorCodes: ["verification-exception"] };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message, recaptchaToken }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify reCAPTCHA token (soft check - log but don't block on verification failure)
    if (!recaptchaToken) {
      console.warn("No reCAPTCHA token provided - proceeding with caution");
    } else {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      console.log("reCAPTCHA result:", JSON.stringify(recaptchaResult));
      
      if (recaptchaResult.success && recaptchaResult.score < 0.3) {
        // Only block very low scores (likely bots)
        console.error("Very low reCAPTCHA score:", recaptchaResult.score);
        return new Response(
          JSON.stringify({ error: "Suspicious activity detected" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      if (!recaptchaResult.success) {
        console.warn("reCAPTCHA verification failed but proceeding:", recaptchaResult.errorCodes);
      } else {
        console.log("reCAPTCHA passed, score:", recaptchaResult.score);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 1000) {
      console.error("Field length exceeded");
      return new Response(
        JSON.stringify({ error: "Field length exceeded" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending contact email from:", email, "Subject:", subject);

    // Send email to admin using Resend API
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Toán Tư Duy <onboarding@resend.dev>",
        to: ["hoangquockhanh204@gmail.com"],
        reply_to: email,
        subject: `[Liên hệ] ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tin nhắn liên hệ mới</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📬 Tin nhắn mới từ Toán Tư Duy</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #333; margin-top: 0; font-size: 18px;">📋 Thông tin người gửi</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Họ tên:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                      <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Chủ đề:</strong></td>
                      <td style="padding: 8px 0; color: #333;">${subject}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 20px;">
                  <h3 style="color: #333; margin-top: 0; font-size: 16px;">💬 Nội dung tin nhắn:</h3>
                  <p style="color: #333; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  📧 Phản hồi trực tiếp bằng cách reply email này
                </p>
                <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                  Gửi từ website Toán Tư Duy lúc ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      const errorData = await adminEmailResponse.text();
      console.error("Failed to send admin email:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    console.log("Admin email sent successfully");

    // Send confirmation email to the sender
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Toán Tư Duy <onboarding@resend.dev>",
        to: [email],
        subject: "Chúng mình đã nhận được tin nhắn của bạn! 📬",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận tin nhắn</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Tin nhắn đã được gửi thành công!</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Xin chào <strong>${name}</strong>,
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Cảm ơn bạn đã liên hệ với <strong>Toán Tư Duy</strong>! Chúng mình đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng <strong>24 giờ</strong>.
                </p>
                
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0; font-size: 16px;">📝 Tóm tắt tin nhắn của bạn:</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Chủ đề:</strong> ${subject}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Nội dung:</strong></p>
                  <p style="color: #333; line-height: 1.6; white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #eee;">${message}</p>
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Chúc bạn một ngày tốt lành! 🌟
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  🏠 280 An Dương Vương, Phường 4, Quận 5, TP.HCM
                </p>
                <p style="color: #666; margin: 5px 0; font-size: 14px;">
                  📞 0392 290 338 | 📧 hoangquockhanh204@gmail.com
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!confirmationResponse.ok) {
      console.error("Failed to send confirmation email, but admin email was sent");
    } else {
      console.log("Confirmation email sent to:", email);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
