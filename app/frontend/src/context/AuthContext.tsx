import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useApolloClient, gql } from '@apollo/client';
import { AuthContext } from './authCore';
import type { User } from './authCore';

const VERIFY_ME = gql`
  query VerifyMe {
    me {
      id
      email
      role
      firstName
      lastName
      permissions
      ownerId
      profileId
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const client = useApolloClient();
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            // 1. Basic Client-side Expiry Check
            try {
                const decoded = jwtDecode<User & { exp: number }>(storedToken);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    throw new Error("Expired");
                }
            } catch (e) {
                console.warn(`{${e}}: Token expired or invalid format`);
                localStorage.removeItem('token');
                setToken(null);
                setLoading(false);
                return;
            }

            // 2. Server-side Verification
            try {
                const { data } = await client.query({
                    query: VERIFY_ME,
                    fetchPolicy: 'network-only'
                });

                if (data && data.me) {
                    setUser({
                        userId: data.me.id,
                        email: data.me.email,
                        role: data.me.role,
                        firstName: data.me.firstName,
                        lastName: data.me.lastName
                    });
                    setToken(storedToken);
                } else {
                    throw new Error("Invalid session data");
                }
            } catch (err) {
                console.error("Token verification failed:", err);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [client]);

    const login = (newToken: string) => {
        setToken(newToken);
        try {
            const decoded = jwtDecode<User>(newToken);
            setUser(decoded);
            localStorage.setItem('token', newToken);
        } catch (e) {
            console.error("Invalid token", e);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        client.resetStore().catch(e => console.error("Failed to reset store", e));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
