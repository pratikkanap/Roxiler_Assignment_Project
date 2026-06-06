(async () => {
  try {
    const base = 'http://localhost:5000';
    const suffix = Date.now();
    const newUserEmail = `beth-${suffix}@example.com`;
    // Login as admin
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'Password123!' })
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN STATUS:', loginRes.status);
    console.log(loginJson);
    const token = loginJson.token;
    if (!token) return console.error('No token returned');

    // Call admin dashboard
    const dashRes = await fetch(`${base}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('DASH STATUS:', dashRes.status);
    console.log(await dashRes.text());

    // Create a new user via admin route
    const newUserRes = await fetch(`${base}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Bethany Normal User Account',
        email: newUserEmail,
        password: 'AdminPass1!',
        address: '42 Admin Lane',
        role: 'User'
      })
    });
    console.log('CREATE USER STATUS:', newUserRes.status);
    console.log(await newUserRes.text());

    // Get all users
    const usersRes = await fetch(`${base}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET USERS STATUS:', usersRes.status);
    console.log(await usersRes.text());

  } catch (err) {
    console.error(err);
  }
})();
