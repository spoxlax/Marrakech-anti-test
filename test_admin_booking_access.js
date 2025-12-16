// Native fetch in Node 18+

const GATEWAY_URL = 'http://localhost:4000/graphql';

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        email
        role
      }
    }
  }
`;

const VENDOR_BOOKINGS_QUERY = `
  query VendorBookings {
    vendorBookings {
      id
      status
      totalPrice
    }
  }
`;

async function testAdminAccess() {
  console.log('1. Logging in as Admin...');
  try {
    const loginRes = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOGIN_MUTATION,
        variables: { email: 'amer.assouli@gmail.com', password: 'Spoxlax@123.' }
      })
    });

    const loginData = await loginRes.json();
    
    if (loginData.errors) {
      console.error('Login Failed:', JSON.stringify(loginData.errors, null, 2));
      return;
    }

    const { token, user } = loginData.data.login;
    console.log(`Login Successful. User: ${user.email}, Role: ${user.role}`);

    if (user.role !== 'admin') {
      console.error('CRITICAL: User is not an admin!');
      return;
    }

    console.log('2. Fetching Vendor Bookings as Admin...');
    const bookingRes = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token 
      },
      body: JSON.stringify({ query: VENDOR_BOOKINGS_QUERY })
    });

    const bookingData = await bookingRes.json();

    if (bookingData.errors) {
      console.error('❌ Query Failed:', JSON.stringify(bookingData.errors, null, 2));
    } else {
      console.log('✅ Query Successful!');
      console.log('Bookings found:', bookingData.data.vendorBookings.length);
    }

  } catch (error) {
    console.error('Network Error:', error);
  }
}

testAdminAccess();
