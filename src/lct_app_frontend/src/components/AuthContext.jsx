
import { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../declarations/lct_app_backend/index.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [principal, setPrincipal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticatedActor, setAuthenticatedActor] = useState(null);

    const createAuthenticatedActor = async (identity) => {
        try {
            // Always use ic0.app for mainnet
            const agent = new HttpAgent({
                identity,
                host: "https://icp-api.io"
            });

            // Create new actor with authenticated identity
            const actor = Actor.createActor(idlFactory, {
                agent,
                canisterId
            });

            console.log("Created authenticated actor with canisterId:", canisterId);
            return actor;
        } catch (error) {
            console.error("Error creating authenticated actor:", error);
            return null;
        }
    };

    const checkAuth = async () => {
        try {
            console.log("Starting auth check...");
            const authClient = await AuthClient.create({
                idleOptions: {
                    disableDefaultIdleCallback: true,
                    idleTimeout: 1000 * 60 * 30
                }
            });

            const isAuthenticated = await authClient.isAuthenticated();
            console.log("Is authenticated:", isAuthenticated);

            if (isAuthenticated) {
                const identity = authClient.getIdentity();
                const principalId = identity.getPrincipal().toText();
                console.log("Setting principal:", principalId);
                setPrincipal(principalId);

                // Create and set authenticated actor
                const actor = await createAuthenticatedActor(identity);
                if (actor) {
                    setAuthenticatedActor(actor);
                    console.log("Authenticated actor set successfully");
                }
            } else {
                console.log("No authentication found");
                setPrincipal(null);
                setAuthenticatedActor(null);
            }
        } catch (error) {
            console.error("Auth check error:", error);
            setPrincipal(null);
            setAuthenticatedActor(null);
        } finally {
            console.log("Completing auth check");
            setLoading(false);
        }
    };

    const login = async () => {
        try {
            const authClient = await AuthClient.create();

            const loginOptions = {
                identityProvider: 'https://identity.ic0.app/#authorize',
                windowOpenerFeatures: `
                    width=800,
                    height=600,
                    left=${(window.screen.width - 800) / 2},
                    top=${(window.screen.height - 600) / 2},
                    toolbar=0,
                    location=0,
                    menubar=0,
                    status=0
                `,
                onSuccess: async () => {
                    const identity = authClient.getIdentity();
                    const principalId = identity.getPrincipal().toText();
                    console.log("Login successful, principal:", principalId);
                    setPrincipal(principalId);

                    const actor = await createAuthenticatedActor(identity);
                    if (actor) {
                        setAuthenticatedActor(actor);
                        console.log("Authenticated actor set after login");
                    }
                },
                onError: (error) => {
                    console.error("Login failed:", error);
                    if (error.message?.includes('popup')) {
                        alert("Please allow popups for this site to login. You can do this by clicking the 'aA' button in Safari's address bar and enabling pop-up windows.");
                    }
                }
            };

            await authClient.login(loginOptions);
        } catch (error) {
            console.error("Login error:", error);
            // Check if error is popup related
            if (error.message?.includes('popup')) {
                alert("Please allow popups for this site to login. Check your browser settings.");
            }
        }
    };

    const logout = async () => {
        try {
            const authClient = await AuthClient.create();
            await authClient.logout();
            setPrincipal(null);
            setAuthenticatedActor(null);
            window.location.href = '/';
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        console.log("Auth Provider mounted");
        checkAuth();
    }, []);

    const value = {
        principal,
        setPrincipal,
        loading,
        login,
        logout,
        checkAuth,
        authenticatedActor
    };

    console.log("Auth Context state:", {
        principal,
        loading,
        hasAuthenticatedActor: !!authenticatedActor
    });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
