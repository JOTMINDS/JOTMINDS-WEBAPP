export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP code are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY environment variable is missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "JotMinds <noreply@jotminds.com>",
        to: [email],
        subject: "Your JotMinds Verification Code",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #ffffff; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome to JotMinds!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Please use the 6-digit verification code below to complete your account setup:</p>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This verification code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      })
    });

    const data = await resendResponse.json();

    return new Response(JSON.stringify({ success: resendResponse.ok, data }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}
