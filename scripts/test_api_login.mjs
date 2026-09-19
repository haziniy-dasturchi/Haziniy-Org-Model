async function testLoginRoute() {
  console.log("🔐 API orqali kirish tekshirilmoqda...");

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "+998889692313",
        password: "89692313",
      }),
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response data:", data);
    console.log("Cookies:", res.headers.get("set-cookie"));
  } catch (err) {
    console.error("Test error:", err);
  }
}

testLoginRoute();
