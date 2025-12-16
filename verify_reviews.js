// Native fetch is available in Node 18+

const GRAPHQL_URL = 'http://localhost:4000/graphql';

async function query(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

async function verify() {
  console.log('1. Logging in...');
  const loginRes = await query(`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user { id firstName }
      }
    }
  `, { input: { email: 'admin@example.com', password: 'password123' } });

  if (loginRes.errors) {
      // Try signup if login fails
      console.log('Login failed (maybe user missing), trying signup...');
       const signupRes = await query(`
        mutation Signup($input: SignupInput!) {
        signup(input: $input) {
            token
            user { id firstName }
        }
        }
    `, { input: { firstName: 'Tester', lastName: 'Reviewer', email: 'admin@example.com', password: 'password123' } });
    
     if (signupRes.errors) {
        console.error('Signup failed:', JSON.stringify(signupRes.errors));
        return;
     }
     var token = signupRes.data.signup.token;
     var userId = signupRes.data.signup.user.id;
  } else {
      var token = loginRes.data.login.token;
      var userId = loginRes.data.login.user.id;
  }
  console.log('Logged in as:', userId);

  console.log('2. Fetching Activities...');
  const actsRes = await query(`{ activities { id vendorId title } }`);
  const activity = actsRes.data.activities[0];
  if (!activity) {
    console.error('No activities found');
    return;
  }
  const activityId = activity.id;
  const vendorId = activity.vendorId || activityId; // Fallback if vendorId missing
  console.log('Target Activity:', activityId);

  console.log('3. Creating Review...');
  const reviewRes = await query(`
    mutation CreateReview($input: CreateReviewInput!) {
      createReview(input: $input) {
        id
        comment
        rating
      }
    }
  `, {
    input: {
      activityId,
      bookingId: activityId, // Using activityId as a valid ObjectId 
      vendorId,
      rating: 5,
      comment: "Verified Federated Review!"
    }
  }, token);

  if (reviewRes.errors) console.error('Create Review Errors:', reviewRes.errors);
  else console.log('Review Created:', reviewRes.data.createReview.id);

  console.log('4. Verifying Federation (Fetching Review with User)...');
  const fedRes = await query(`
    query GetReviews($activityId: ID!) {
      reviews(activityId: $activityId) {
        id
        comment
        user {
          firstName
          lastName
        }
      }
    }
  `, { activityId });

  if (fedRes.errors) {
    console.error('Federation Query Failed:', JSON.stringify(fedRes.errors, null, 2));
  } else {
    const reviews = fedRes.data.reviews;
    const myReview = reviews.find(r => r.comment === "Verified Federated Review!");
    if (myReview && myReview.user && myReview.user.firstName) {
        console.log('SUCCESS: Review User Resolved:', myReview.user.firstName);
    } else {
        console.error('FAILURE: User field missing or null:', JSON.stringify(myReview, null, 2));
    }
  }
}

verify();
