async function run() {
  const email = "realtest123@example.com";
  
  // 1. Generate OTP
  console.log("Generating OTP...");
  const res1 = await fetch("https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/send-otp", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  console.log("Send OTP status:", res1.status, await res1.text());

  // Wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  // 2. We can't know the OTP since it's generated on the server!
  // But wait, the simulated OTP code...
  console.log("Done");
}
run();
