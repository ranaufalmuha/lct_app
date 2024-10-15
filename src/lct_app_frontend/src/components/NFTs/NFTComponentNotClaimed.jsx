import React, { useRef, useState } from 'react';
import QRCode from 'react-qr-code';

export const NFTComponentNotClaimed = () => {
    const [NFTId, setNFTId] = useState(1);
    const [NFTName, setNFTName] = useState("Black Lost");
    const [principal, setPrincipal] = useState("4n567-xaaaa-aaaai-qpk3a-cai");
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);
    const [qrcodeLink, setQRCodeLink] = useState("https://4k4yl-2yaaa-aaaai-qpk3q-cai.icp0.io/claim/1");

    const qrRef = useRef(null);

    function openModalNFT() {
        setIsModalNFTOpen(true);
    }

    function closeModalNFT() {
        setIsModalNFTOpen(false);
    }

    // Function to download QR code
    const downloadQRCode = () => {
        const svg = qrRef.current.querySelector('svg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match the QR code size
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convert canvas to data URL and trigger download
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngFile;
            downloadLink.download = `${NFTName}_QRCode.png`;
            downloadLink.click();
            URL.revokeObjectURL(url); // Clean up the URL object
        };
        img.src = url;
    };
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
                <div className="flex justify-end w-full">
                    <button className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300 max-md:rounded-md' onClick={openModalNFT}>
                        <img src="./assets/qr.png" className='w-6 h-6 max-md:w-4 max-md:h-4 object-contain ' alt="" />
                    </button>
                </div>
            </button>

            {/* ModalNFT */}
            {isModalNFTOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Background hitam transparan */}
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalNFT}></div>

                    {/* ModalNFT content */}
                    <div className="bg-white rounded-3xl shadow-lg z-10 overflow-hidden max-md:w-full md:w-3/4 max-w-[1000px] mx-5 p-3 max-h-5/6 relative max-md:m-10">
                        <div className="flex max-md:flex-col  overflow-auto">
                            <button onClick={closeModalNFT} className="px-4 py-2 hover:text-gray-300 absolute right-4 top-4">X</button>
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={qrcodeLink}
                                viewBox={`0 0 256 256`}
                                className='w-1/2 max-md:w-full aspect-square object-cover p-5'
                            />
                            <div className="w-1/2 max-lg:w-full p-5 flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <p >#{NFTId}</p>
                                    <p className="text-xl font-bold ">{NFTName}</p>
                                </div>
                                <button onClick={downloadQRCode} className=' bg-gradient-to-b from-black via-black to-gray-800 text-white py-2 px-5 rounded-lg hover:scale-105 duration-300'>Download QR</button>
                                <div className=""></div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
