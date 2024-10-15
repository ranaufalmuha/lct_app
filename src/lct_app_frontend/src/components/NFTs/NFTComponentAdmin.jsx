import React, { useState } from 'react';

export const NFTComponentAdmin = () => {
    const [NFTId, setNFTId] = useState(1);
    const [NFTName, setNFTName] = useState("Black Lost");
    const [principal, setPrincipal] = useState("rvvasdaio-adjkakjdsa-ajdsia");
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);

    function openModalNFT() {
        setIsModalNFTOpen(true);
    }

    function closeModalNFT() {
        setIsModalNFTOpen(false);
    }
    return (
        <div className="">
            <button className='bg-white shadow-lg shadow-black/20  rounded-2xl max-md:rounded-lg overflow-hidden flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default max-md:gap-3' >
                <div className="w-full aspect-square rounded-2xl max-md:rounded-xl overflow-hidden">
                    <img src="./images/FinalLogo.jpeg" className='w-full aspect-square bg-black/10 ' alt="" />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1 max-md:text-base'>{NFTName}</p>
                    <p className='max-md:text-sm'>#{NFTId}</p>
                </div>
            </button>

            {/* ModalNFT */}
            {isModalNFTOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Background hitam transparan */}
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalNFT}></div>

                    {/* ModalNFT content */}
                    <div className="bg-white rounded-3xl shadow-lg z-10 overflow-hidden max-md:w-full md:w-3/4 max-w-[1000px] mx-5 p-3 max-h-5/6 relative">
                        <div className="flex max-lg:flex-col overflow-auto">
                            <button onClick={closeModalNFT} className="px-4 py-2 hover:text-gray-300 absolute right-4 top-4">X</button>
                            <img src="./images/FinalLogo.jpeg" className=' w-1/2 max-lg:w-full aspect-square object-cover bg-black/10 rounded-2xl' alt="" />
                            <div className="w-1/2 max-lg:w-full p-5 flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <p >#{NFTId}</p>
                                    <p className="text-xl font-bold ">{NFTName}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className='text-sm text-disabled'>Send NFT</p>
                                    <div className="flex gap-1">
                                        <input type="text" placeholder='Principal Id' className='w-full border border-disabled rounded-lg px-3 py-1 text-sm' />
                                        <button className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300'>
                                            <img src="./assets/send.png" className='w-6 h-6 object-contain ' alt="" />
                                        </button>
                                    </div>
                                </div>
                                <div className=""></div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
