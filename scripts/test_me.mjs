async function testMeRoute() {
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "+998889692313",
      password: "89692313",
    }),
  });

  const cookie = loginRes.headers.get("set-cookie");

  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Cookie: cookie,
    },
  });

  const meData = await meRes.json();
  console.log("Current Admin User from Session:", meData);
}

testMeRoute();
