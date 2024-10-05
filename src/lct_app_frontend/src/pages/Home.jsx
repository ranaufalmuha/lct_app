import React, { useState } from 'react';
import { useAuth } from './../components/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const { principal, logout } = useAuth();
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    function copyToClipboard() {
        navigator.clipboard.writeText(principal);

        // Tampilkan alert
        setShowAlert(true);

        // Sembunyikan alert setelah 1 detik (1000 ms)
        setTimeout(() => {
            setShowAlert(false);
        }, 1000);
    }

    return (

        <main className=''>
            {/* Main content */}
            <section className='h-[45vh] min-h-[400px] bg-gradient-to-b from-black via-black to-gray-800 text-white p-6 flex flex-col'>
                <div className="flex items-center justify-between">
                    <div className="w-40 max-sm:w-4"></div>
                    <div className="flex justify-center items-center">
                        <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                        <p className='text-center'>Lost Club Toys</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button onClick={copyToClipboard} className='opacity-50 w-36 relative line-clamp-1 text-sm max-sm:hidden p-1 bg-gray-600 border border-white rounded-md'>{principal}</button>
                        <button onClick={handleLogout}><img src="./assets/logout.png" alt="" className='w-4 aspect-square' /></button>
                    </div>

                </div>

                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <div className='flex flex-col items-center  gap-1'>
                        <p className='text-8xl'>5</p>
                        <p> NFTs</p>
                    </div>
                </div>
            </section>

            {/* NFTs  */}
            <section className=' flex justify-center mt-5'>
                <div className="container max-sm:p-4 grid grid-cols-4 max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full">
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                </div>
            </section>
            <div className="mb-20"></div>
            {/* ========================================================== */}
            <a href='/admin'>admin</a>
            {/* ========================================================== */}
            <div
                className={`${showAlert ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-500 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 absolute top-0 flex flex-col gap-1 w-[300px]`}
                role="alert"
            >
                <p className="font-bold text-sm">Copy Successfully</p>
                <p className='text-xs'>Copied: {principal}</p>
            </div>

        </main>
    );
}

export default Home;
