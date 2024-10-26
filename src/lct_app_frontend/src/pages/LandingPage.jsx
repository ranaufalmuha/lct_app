import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './../components/AuthContext';

function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { principal, login } = useAuth();

    useEffect(() => {
        if (principal) {
            // Check if there's a stored redirect path
            const redirectPath = sessionStorage.getItem('redirectPath');
            if (redirectPath) {
                sessionStorage.removeItem('redirectPath');
                navigate(redirectPath);
            } else {
                // Default navigation to home if no stored path
                navigate('/home');
            }
        }
    }, [principal, navigate]);

    const handleLogin = async () => {
        try {
            // Store current intended path if any (from location state)
            const intendedPath = location.state?.from?.pathname;
            if (intendedPath) {
                sessionStorage.setItem('redirectPath', intendedPath);
            }
            await login();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <main className=''>
            <section className='h-[45vh] min-h-[400px] bg-gradient-to-b from-black via-black to-gray-800 text-white p-6 flex flex-col'>
                <div className="flex justify-center items-center">
                    <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                    <p className='text-center'>Lost Club Toys</p>
                </div>
                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <p className='text-center font-bold max-w-[600px] text-2xl'>
                        Earn cool NFTs! Grab your exclusive LCT NFT at the Token2049 afterparty.
                    </p>
                    <button
                        className='px-9 py-4 rounded-full bg-white text-black flex justify-center items-center gap-1'
                        onClick={handleLogin}
                    >
                        <p>Authenticate</p>
                        <img src="./images/logo-full-black.png" className='w-6' alt="" />
                    </button>
                </div>
            </section>
        </main>
    );
}

export default LandingPage;