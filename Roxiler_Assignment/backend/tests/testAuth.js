(async () => {
  try {
    const base = 'http://localhost:5000';
    const suffix = Date.now();
    const userEmail = `alex-${suffix}@example.com`;
    // Signup
    const signupRes = await fetch(`${base}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Mercer Example User',
        email: userEmail,
        password: 'Password123!',
        address: '123 Innovation Way, Tech District'
      })
    });
    const signupBody = await signupRes.text();
    console.log('SIGNUP STATUS:', signupRes.status);
    console.log(signupBody);

    // Login
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'Password123!' })
    });
    const loginBody = await loginRes.text();
    console.log('LOGIN STATUS:', loginRes.status);
    console.log(loginBody);
  } catch (err) {
    console.error(err);
  }
})();
