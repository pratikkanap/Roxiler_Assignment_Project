(async () => {
  try {
    const base = 'http://localhost:5000';
    const suffix = Date.now();
    const cornerEmail = `corner-${suffix}@example.com`;
    const ownerEmail = `owner-${suffix}@example.com`;
    const bistroEmail = `bistro-${suffix}@example.com`;

    // Login as admin to create stores and owners
    const adminLoginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'Password123!' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;

    // Create a store without owner (for normal user to rate)
    const store1Res = await fetch(`${base}/api/admin/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Corner Cafe', email: cornerEmail, address: '1 Main St' })
    });
    console.log('CREATE STORE1 STATUS:', store1Res.status);
    console.log(await store1Res.text());

    // Create a StoreOwner user
    const ownerRes = await fetch(`${base}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Owner One Store Operator', email: ownerEmail, password: 'OwnerPass1!', address: 'Store Owner Address', role: 'StoreOwner' })
    });
    let ownerId;
    const ownerBody = await ownerRes.json();
    console.log('CREATE OWNER STATUS:', ownerRes.status, ownerBody);
    if (ownerRes.status === 201) {
      ownerId = ownerBody.user.id;
    } else {
      // If owner already exists, login to retrieve id
      const ownerLoginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'owner1@example.com', password: 'OwnerPass1!' })
      });
      const ownerLogin = await ownerLoginRes.json();
      ownerId = ownerLogin.user && ownerLogin.user.id;
    }

    // Create a store with ownerId
    const store2Res = await fetch(`${base}/api/admin/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: "Owner's Bistro", email: bistroEmail, address: '22 Market St', ownerId })
    });
    console.log('CREATE STORE2 STATUS:', store2Res.status);
    console.log(await store2Res.text());

    // Login as normal user 'beth@example.com'
    const userLoginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'beth@example.com', password: 'AdminPass1!' })
    });
    const userLogin = await userLoginRes.json();
    const userToken = userLogin.token;
    console.log('USER LOGIN STATUS:', userLoginRes.status);

    // Get stores as user
    const listRes = await fetch(`${base}/api/core/stores`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    console.log('LIST STORES STATUS:', listRes.status);
    console.log(await listRes.text());

    // Rate the first store (Corner Cafe)
    // Need to fetch stores to get id
    const stores = await (await fetch(`${base}/api/core/stores`, { headers: { 'Authorization': `Bearer ${userToken}` } })).json();
    const storeToRate = stores[0];
    const rateRes = await fetch(`${base}/api/core/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ storeId: storeToRate.id, rating: 5 })
    });
    console.log('RATE STATUS:', rateRes.status);
    console.log(await rateRes.text());

    // Login as owner and get owner-dashboard
    const ownerLoginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner1@example.com', password: 'OwnerPass1!' })
    });
    const ownerLogin = await ownerLoginRes.json();
    const ownerToken = ownerLogin.token;
    console.log('OWNER LOGIN STATUS:', ownerLoginRes.status);

    const ownerDashRes = await fetch(`${base}/api/core/owner-dashboard`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    console.log('OWNER DASH STATUS:', ownerDashRes.status);
    console.log(await ownerDashRes.text());

  } catch (err) {
    console.error(err);
  }
})();
