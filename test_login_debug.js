// Native fetch in Node 22

const query = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

const variables = {
  input: {
    email: "debug_test@example.com",
    password: "password123"
  }
};

async function test() {
  try {
    const response = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
