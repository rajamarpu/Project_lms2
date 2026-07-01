const { Client } = require('./backend/node_modules/pg');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

async function testDelete() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  try {
    const ts = Date.now();
    const email = `inst_${ts}@test.com`;
    // Register
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Inst', email, password: 'Password123', role: 'instructor' })
    });
    const regData = await regRes.json();
    console.log('Register data:', regData);
    
    // Get OTP from db
    const res = await client.query('SELECT "verificationOTP" FROM "User" WHERE email = $1', [email]);
    const otp = res.rows[0].verificationOTP;

    // Verify Email
    const verifyRes = await fetch('http://localhost:5000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const verifyData = await verifyRes.json();
    console.log('Verify data:', verifyData);
    const token = verifyData.token;
    
    // Create course
    const createRes = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Delete', description: 'Test', category: 'Test', level: 'Beginner', price: 0 })
    });
    const createData = await createRes.json();
    console.log('Create course data:', createData);
    const courseId = createData.data.id;
    console.log('Created course:', courseId);

    // Enroll in course
    const enrollRes = await fetch(`http://localhost:5000/api/enrollments/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    console.log('Enroll status:', enrollRes.status);

    // Delete course
    const deleteRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const deleteData = await deleteRes.json();
    console.log('Delete status:', deleteRes.status);
    console.log('Delete response:', deleteData);
  } catch (err) {
    console.log('Test failed:', err);
  } finally {
    await client.end();
  }
}

testDelete();
