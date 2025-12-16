// Native fetch in Node 22

// 1. Login to get token
// 2. Mock a booking request

const loginQuery = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id }
    }
  }
`;

const createBookingMutation = `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      totalPrice
    }
  }
`;

// Need a valid activity ID. For this test, I'll allow the resolver to use a fallback or I should fetch one.
// But to keep it simple, I'll first fetch one activity.

const getActivitiesQuery = `
  query {
    activities {
      id
      vendorId
      title
      priceAdult
    }
  }
`;

async function test() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: loginQuery, 
        variables: { input: { email: "debug_test@example.com", password: "password123" } } 
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.login?.token;
    
    if (!token) {
        console.error("Login failed", loginData);
        return;
    }
    console.log("Login successful. Token obtained.");

    // 2. Get Activity
    const actRes = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: getActivitiesQuery })
      });
    const actData = await actRes.json();
    const activity = actData.data?.activities?.[0];

    if (!activity) {
        console.error("No activities found to book.");
        return;
    }
    console.log(`Booking activity: ${activity.title} (${activity.id})`);

    // 3. Create Booking
    const bookingRes = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: createBookingMutation, 
          variables: { 
              input: {
                  activityId: activity.id,
                  vendorId: activity.vendorId, // Required by schema
                  date: "2025-12-25",
                  persons: { adults: 2, children: 0 },
                  totalPrice: activity.priceAdult * 2
              }
          } 
        })
      });
    
    const bookingData = await bookingRes.json();
    console.log("Booking Result:", JSON.stringify(bookingData, null, 2));

  } catch (error) {
    console.error(error);
  }
}

test();
