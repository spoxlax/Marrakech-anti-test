import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authCore';
import type { User } from './authCore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            return null;
        }
        try {
            return jwtDecode<User>(storedToken);
        } catch (e) {
            console.error("Invalid token", e);
            localStorage.removeItem('token');
            return null;
        }
    });

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
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
