import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
    uri: 'http://localhost:5000/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message }) => {
            if (
                message.includes('Unauthorized') ||
                message.includes('Forbidden') ||
                message.includes('jwt') ||
                message.includes('token')
            ) {
                const token = localStorage.getItem('token');
                if (token) {
                    localStorage.removeItem('token');
                    // Force redirect to login
                    window.location.href = '/login';
                }
            }
        });
    }
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});

export default client;
