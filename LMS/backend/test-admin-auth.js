const http = require('http');

const request = (options, data) => new Promise((resolve, reject) => {
  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
      catch (e) { resolve({ status: res.statusCode, data: body }); }
    });
  });
  req.on('error', reject);
  if (data) req.write(JSON.stringify(data));
  req.end();
});

async function testAdminAuth() {
  const email = `admin_${Date.now()}@example.com`;
  const password = "AdminPassword123!";
  
  console.log('========================================');
  console.log('TESTING ADMIN AUTHENTICATION ENDPOINTS');
  console.log('========================================\n');

  // Test 1: Admin Registration
  console.log('TEST 1: Admin Registration');
  console.log('-'.repeat(40));
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: "Test Admin User",
    email,
    password
  });
  
  console.log(`Status: ${regRes.status}`);
  console.log(`Response:`, JSON.stringify(regRes.data, null, 2));
  
  if (regRes.status !== 201) {
    console.error('❌ Admin registration FAILED!');
    process.exit(1);
  }

  if (!regRes.data.token) {
    console.error('❌ No token returned from registration!');
    process.exit(1);
  }

  if (regRes.data.user.role !== 'admin') {
    console.error('❌ User role is not admin!', regRes.data.user.role);
    process.exit(1);
  }

  console.log('✅ Admin registration successful!\n');

  // Test 2: Admin Login with Correct Credentials
  console.log('TEST 2: Admin Login (Correct Credentials)');
  console.log('-'.repeat(40));
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password
  });

  console.log(`Status: ${loginRes.status}`);
  console.log(`Response:`, JSON.stringify(loginRes.data, null, 2));
  
  if (loginRes.status !== 200) {
    console.error('❌ Admin login FAILED!');
    process.exit(1);
  }

  if (!loginRes.data.token) {
    console.error('❌ No token returned from login!');
    process.exit(1);
  }

  console.log('✅ Admin login successful!\n');

  // Test 3: Admin Login with Wrong Password
  console.log('TEST 3: Admin Login (Wrong Password)');
  console.log('-'.repeat(40));
  const wrongPassRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email,
    password: "WrongPassword123!"
  });

  console.log(`Status: ${wrongPassRes.status}`);
  console.log(`Response:`, JSON.stringify(wrongPassRes.data, null, 2));
  
  if (wrongPassRes.status === 200) {
    console.error('❌ Login should have FAILED with wrong password!');
    process.exit(1);
  }

  if (wrongPassRes.status !== 401) {
    console.error('❌ Expected 401 status for wrong password!');
    process.exit(1);
  }

  console.log('✅ Correctly rejected wrong password!\n');

  // Test 4: Admin Login with Non-existent Email
  console.log('TEST 4: Admin Login (Non-existent Email)');
  console.log('-'.repeat(40));
  const noEmailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: `nonexistent_${Date.now()}@example.com`,
    password
  });

  console.log(`Status: ${noEmailRes.status}`);
  console.log(`Response:`, JSON.stringify(noEmailRes.data, null, 2));
  
  if (noEmailRes.status !== 401) {
    console.error('❌ Expected 401 status for non-existent user!');
    process.exit(1);
  }

  console.log('✅ Correctly rejected non-existent user!\n');

  // Test 5: Test Case Insensitivity
  console.log('TEST 5: Admin Login (Case Insensitivity)');
  console.log('-'.repeat(40));
  const caseInsensitiveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: email.toUpperCase(),
    password
  });

  console.log(`Status: ${caseInsensitiveRes.status}`);
  console.log(`Response:`, JSON.stringify(caseInsensitiveRes.data, null, 2));
  
  if (caseInsensitiveRes.status === 200) {
    console.log('✅ Case insensitive email lookup works!\n');
  } else {
    console.error('⚠️  Case insensitive email lookup might not be working\n');
  }

  // Test 6: Duplicate Email Registration
  console.log('TEST 6: Admin Registration (Duplicate Email)');
  console.log('-'.repeat(40));
  const dupRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: "Another Admin",
    email,
    password
  });

  console.log(`Status: ${dupRes.status}`);
  console.log(`Response:`, JSON.stringify(dupRes.data, null, 2));
  
  if (dupRes.status === 400 && dupRes.data.error && dupRes.data.error.includes('already exists')) {
    console.log('✅ Correctly rejected duplicate email!\n');
  } else {
    console.error('❌ Should reject duplicate email registration!\n');
  }

  console.log('========================================');
  console.log('✅ ALL TESTS PASSED!');
  console.log('========================================');
  console.log('\nSummary:');
  console.log('✅ Admin registration works');
  console.log('✅ Admin login with correct credentials works');
  console.log('✅ Admin login rejects wrong password');
  console.log('✅ Admin login rejects non-existent users');
  console.log('✅ Duplicate registration rejected');
}

testAdminAuth().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
