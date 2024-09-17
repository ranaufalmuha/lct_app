import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthClient } from "@dfinity/auth-client";
import { useAuth } from './../components/AuthContext';

function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();  // Get the current location
    const { setPrincipal } = useAuth();
    const { principal } = useAuth();

    useEffect(() => {
        // Check if the user is logged in and avoid redirection loops
        if (principal) {
            if (location.pathname === '/') {
                navigate('/home');  // Send to home after login from landing
            }
        }
    }, [principal, navigate, location]);

    const init = async () => {
        const authClient = await AuthClient.create();

        if (await authClient.isAuthenticated()) {
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toText();

            setPrincipal(principal);
            navigate('/home');
        } else {
            await authClient.login({
                identityProvider: "https://identity.ic0.app/#authorize",
                onSuccess: () => {
                    const identity = authClient.getIdentity();
                    const principal = identity.getPrincipal().toText();

                    setPrincipal(principal);
                    navigate('/home');
                },
            });
        }
    };

    return (
        <main className=''>
            {/* Main content */}
            <section className='h-[45vh] min-h-[400px] bg-gradient-to-b from-black via-black to-gray-800 text-white p-6 flex flex-col'>
                <div className="flex justify-center items-center">
                    <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                    <p className='text-center'>Lost Club Toys</p>
                </div>
                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <p className='text-center font-bold max-w-[600px] text-2xl'>Earn cool NFTs! Grab your exclusive LCT NFT at the Token2049 afterparty.</p>
                    <button className='px-9 py-4 rounded-full bg-white text-black flex justify-center items-center gap-1' onClick={init}>
                        <p>Authenticate</p>
                        <img src="./images/logo-full-black.png" className='w-6' alt="" />
                    </button>
                </div>
            </section>
        </main>
    );
}

export default LandingPage;
