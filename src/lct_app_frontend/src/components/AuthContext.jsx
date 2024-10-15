// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [principal, setPrincipal] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
            const identity = authClient.getIdentity();
            const principalId = identity.getPrincipal().toText();
            setPrincipal(principalId);
        }
        setLoading(false);
    };

    const logout = async () => {
        const authClient = await AuthClient.create();
        await authClient.logout({
            returnTo: '/',  // Redirect to the homepage or your preferred route after logout
        });
        setPrincipal(null);  // Clear the principal state
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ principal, setPrincipal, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
