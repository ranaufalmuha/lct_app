import React, { useEffect, useState } from 'react';
import { useAuth } from './../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NFTComponent } from '../components/NFTs/NFTComponent';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { Principal } from '@dfinity/principal';

function Home() {
    const { principal, logout } = useAuth();
    const [totalSupply, setTotalSupply] = useState(0);
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nftData, setNftData] = useState([]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const owner = {
                    owner: Principal.fromText(principal),
                    subaccount: []
                };
                const start = [];
                const length = [];

                const tokens = await lct_app_backend.icrc7_tokens_of(owner, start, length);
                setNftData(tokens);
                setTotalSupply(tokens.length);
                console.log("Fetched tokens:", tokens);
            } catch (error) {
                console.error("Error fetching NFTs: ", error);
            }
        };

        fetchNftData();
    }, []);

    function copyToClipboard() {
        navigator.clipboard.writeText(principal);

        // Tampilkan alert
        setShowAlert(true);

        // Sembunyikan alert setelah 1 detik (1000 ms)
        setTimeout(() => {
            setShowAlert(false);
        }, 1000);
    }

    function openModal() {
        setIsModalOpen(true); // Membuka modal
    }

    function closeModal() {
        setIsModalOpen(false); // Menutup modal
    }

    return (

        <main className='duration-300'>
            {/* Main content */}
            <section className='h-[45vh] min-h-[400px] bg-gradient-to-b from-black via-black to-gray-800 text-white p-6 flex flex-col'>
                {/* header  */}
                <div className="flex items-center justify-between">
                    <div className="w-40 max-sm:w-4"></div>
                    <div className="flex justify-center items-center">
                        <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                        <p className='text-center'>Lost Club Toys</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button onClick={copyToClipboard} className='w-36 text-disabled hover:text-white  relative line-clamp-1 text-sm max-sm:hidden py-1 px-1  border border-disabled hover:border-white rounded-md duration-300 leading-6'>{principal}</button>
                        <button onClick={handleLogout}><img src="./assets/logout.png" alt="" className='w-4 aspect-square' /></button>
                    </div>

                </div>

                {/* Mid Content  */}
                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <div className='flex flex-col items-center  gap-1'>
                        <p className='text-8xl'>{totalSupply}</p>
                        <p> NFTs</p>
                    </div>
                </div>

                {/* Button Received */}
                <div className="flex justify-center">
                    <button className="text-disabled hover:text-white leading-6 py-1 px-5 border border-disabled hover:border-white rounded-md duration-300" onClick={openModal}>+ Received</button>
                </div>
            </section>

            {/* NFTs  */}
            <section className=' flex justify-center mt-5'>
                {totalSupply <= 0 ? (
                    <div className="flex justify-center w-full text-disabled">
                        <p>you don't have any nft</p>
                    </div>
                ) : (
                    <div className={`container max-sm:p-4 grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full justify-items-center duration-300`}>
                        {/* Show Component */}
                        {nftData.map((tokenId, index) => (
                            <NFTComponent key={index} NFTId={tokenId} />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center duration-300 transition-opacity">
                    {/* Background black transparan */}
                    <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={closeModal}></div>

                    {/* Modal content */}
                    <div className="bg-white p-6 m-6 rounded-lg shadow-lg z-10 transition-opacity">
                        <p className="text-xl font-bold mb-4">Principal ID</p>
                        <div className="flex flex-col">
                            <button onClick={copyToClipboard} className='hover:text-gray-800 text-disabled  text-sm py-2 px-4  border hover:border-gray-800 border-disabled rounded-md duration-300 flex gap-2 items-center'>
                                <img src="./assets/copy.png" className='w-5 aspect-square object-cover' alt="" />
                                <p className=''>{principal}</p>
                            </button>
                            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gradient-to-b from-black via-black to-gray-800 text-white rounded hover:bg-gradient-to-r duration-300">Close</button>
                        </div>
                    </div>
                </div>
            )}



            <div className="mb-20"></div>
            {/* ========================================================== */}
            {/* <a href='/admin'>admin</a> */}
            {/* ========================================================== */}
            <div
                className={`${showAlert ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-500 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 absolute top-0 flex flex-col gap-1 w-[300px] z-50`}
                role="alert"
            >
                <p className="font-bold text-sm">Copy Successfully</p>
                <p className='text-xs'>Copied: {principal}</p>
            </div>

        </main>
    );
}

export default Home;
