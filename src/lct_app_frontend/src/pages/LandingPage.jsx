import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './../components/AuthContext';

function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { principal, login } = useAuth();
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        if (principal) {
            const redirectPath = sessionStorage.getItem('redirectPath');
            if (redirectPath) {
                sessionStorage.removeItem('redirectPath');
                navigate(redirectPath);
            } else {
                navigate('/home');
            }
        }
    }, [principal, navigate]);

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMacOS = navigator.platform.toLowerCase().includes('mac');

    const handleLogin = async () => {
        try {
            if (isSafari) {
                setShowInstructions(true);
                return;
            }

            const intendedPath = location.state?.from?.pathname;
            if (intendedPath) {
                sessionStorage.setItem('redirectPath', intendedPath);
            }
            await login();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const proceedWithLogin = async () => {
        setShowInstructions(false);
        await login();
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
                        className='px-9 py-4 rounded-full bg-white text-black flex justify-center items-center gap-1 hover:scale-105 duration-300'
                        onClick={handleLogin}
                    >
                        <p>Authenticate</p>
                        <img src="./images/logo-full-black.png" className='w-6' alt="" />
                    </button>
                </div>
            </section>

            {/* Safari Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowInstructions(false)}
                    ></div>
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2">Enable Pop-ups in Safari</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                To use Internet Identity, you'll need to enable pop-ups in Safari settings:
                            </p>
                        </div>

                        {isMacOS ? (
                            <ol className="space-y-3 text-sm text-gray-700 mb-6">
                                <li className="flex gap-2">
                                    <span className="font-bold">1.</span>
                                    Click "Safari" in the top menu bar
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">2.</span>
                                    Select "Settings..." (or Preferences)
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">3.</span>
                                    Click the "Websites" tab
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">4.</span>
                                    Select "Pop-up Windows" from the left sidebar
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">5.</span>
                                    Change the setting to "Allow"
                                </li>
                            </ol>
                        ) : (
                            <ol className="space-y-3 text-sm text-gray-700 mb-6">
                                <li className="flex gap-2">
                                    <span className="font-bold">1.</span>
                                    Go to Settings {'>'} Safari
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">2.</span>
                                    Turn off "Block Pop-ups"
                                </li>
                            </ol>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={proceedWithLogin}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors hover:scale-105 duration-300"
                            >
                                Continue to Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default LandingPage;