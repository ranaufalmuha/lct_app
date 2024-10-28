import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './../components/AuthContext';

function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { principal, login } = useAuth();
    const [showInstructions, setShowInstructions] = useState(false);
    const [social] = useState([
        {
            name: "website",
            icon: "./assets/web.png",
            url: "https://lostclubtoys.com/",
        },
        {
            name: "linkedin",
            icon: "./assets/linkedin.png",
            url: "https://www.linkedin.com/company/lost-club-toys/",
        },
        {
            name: "instagram",
            icon: "./assets/instagram.png",
            url: "https://www.instagram.com/lostclubtoys/",
        },
        {
            name: "telegram",
            icon: "./assets/telegram.png",
            url: "https://t.me/lostclubtoys",
        },
        {
            name: "github",
            icon: "./assets/github.png",
            url: "https://github.com/ranaufalmuha/lct_app",
        }
    ]

    );

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
        <main className='duration-300'>

            <div className="absolute inset-0 -z-20">
                <video
                    autoPlay // Changed from autoplay to autoPlay (React JSX naming)
                    muted
                    loop
                    playsInline // Added for better mobile support
                    className="w-full h-full object-cover"
                >
                    <source
                        src="./videos/lost_club_toys.mp4"
                        type="video/mp4"
                    />
                    Your browser does not support HTML5 video.
                </video>
            </div>

            <section className='h-dvh text-white p-8 md:p-12 flex flex-col relative overflow-hidden'>
                <div className="flex justify-center items-center ">
                    <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                    <p className='text-center'>Lost Club Toys</p>
                </div>

                {/* content */}
                <div className="flex flex-col gap-5 items-start justify-center w-full md:max-w-[500px] h-full duration-300">
                    <p className='text-5xl max-md:w-full max-md:text-center duration-300'>100% On Chain Wallet</p>
                    <p className='text-start max-md:text-center text-xl duration-300'>
                        Earn cool NFTs! Grab your exclusive LCT NFT at the Token2049 afterparty.
                    </p>
                    <div className="flex w-full max-md:justify-center duration-300">
                        <button
                            className='px-9 py-4 rounded-xl bg-white text-black flex justify-center items-center gap-1 hover:scale-105 duration-300'
                            onClick={handleLogin}
                        >
                            <p>Authenticate</p>
                            <img src="./images/logo-full-black.png" className='w-6' alt="" />
                        </button>
                    </div>
                </div>

                {/* footer  */}
                <div className="flex max-lg:flex-col items-center justify-between relative overflow-hidden gap-3 duration-300">
                    <div className="lg:absolute w-full z-0 flex-grow text-center">
                        <p className='text-sm'>&copy; 2024 Developed by Lost Club Toys</p>
                    </div>
                    <div className="flex items-center max-lg:gap-5 gap-3 p-1 duration-300 z-10">
                        {social.map((item) => (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className='aspect-square bg-white rounded-lg hover:scale-110 duration-300' key={item.name}>
                                <img src={item.icon} className='p-2 w-10 h-10 object-contain' alt={item.name} />
                            </a>
                        ))}
                    </div>
                    <div className="my-2"></div>
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