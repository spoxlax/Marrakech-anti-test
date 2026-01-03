const http = require('http');

const query = `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      paymentMethod
      guestToken
    }
  }
`;

const variables = {
  input: {
    activityId: "60d5ecb8b5c9c62b3c1d4a8e", // Dummy ID
    vendorId: "60d5ecb8b5c9c62b3c1d4a8f",   // Dummy ID
    date: "2024-05-01",
    persons: {
      adults: 2,
      children: 0
    },
    totalPrice: 100,
    paymentMethod: "CASH",
    customerInfo: {
      firstName: "Test",
      lastName: "Guest",
      email: "test@guest.com",
      phone: "1234567890"
    },
    guestToken: "test-token-123"
  }
};

const data = JSON.stringify({
  query,
  variables
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
