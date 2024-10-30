import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { lct_app_backend } from 'declarations/lct_app_backend';

export const NFTComponentNotClaimed = ({ NFTId, qrcodeLink }) => {
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: './images/loadingImg.png'
    });
    const qrRef = useRef(null);

    const displayId = typeof NFTId === 'bigint' ? NFTId.toString() :
        Array.isArray(NFTId) ? Number(NFTId).toString() :
            String(NFTId);

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const response = await lct_app_backend.icrc7_token_metadata([NFTId]);

                if (response?.[0]?.[0]) {
                    const metadataObj = {};
                    response[0][0].forEach(metadataEntry => {
                        if (metadataEntry.length === 2) {
                            const key = metadataEntry[0];
                            const value = metadataEntry[1];
                            if (value.Text) {
                                metadataObj[key] = value.Text;
                            }
                        }
                    });
                    const [name] = Object.keys(metadataObj);
                    const imageUrl = metadataObj[name];

                    setNftData({
                        name: name,
                        imageUri: imageUrl
                    });
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        fetchNftData();
    }, [NFTId, displayId]);

    function openModalNFT() {
        setIsModalNFTOpen(true);
    }

    function closeModalNFT() {
        setIsModalNFTOpen(false);
    }

    const downloadQRCode = () => {
        try {
            const svg = qrRef.current.querySelector('svg');
            if (!svg) {
                setDownloadError('QR Code not found');
                return;
            }

            // Create a new SVG with padding and background
            const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            wrapper.setAttribute('width', '1024');
            wrapper.setAttribute('height', '1024');
            wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            // Add white background
            const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            background.setAttribute('width', '1024');
            background.setAttribute('height', '1024');
            background.setAttribute('fill', 'white');
            wrapper.appendChild(background);

            // Clone the QR code SVG and scale it
            const qrCode = svg.cloneNode(true);
            qrCode.setAttribute('width', '800');
            qrCode.setAttribute('height', '800');
            qrCode.setAttribute('x', '112'); // Center horizontally: (1024 - 800) / 2
            qrCode.setAttribute('y', '112'); // Center vertically: (1024 - 800) / 2

            wrapper.appendChild(qrCode);

            // Convert to a data URL
            const svgData = new XMLSerializer().serializeToString(wrapper);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = svgDataUrl;
            downloadLink.download = `${nftData.name}_${displayId}_QRCode.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setDownloadError(null);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            setDownloadError('Failed to download QR code');
        }
    };

    return (
        <div className="">
            <button className='bg-white shadow-lg rounded-2xl flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default'>
                <div className="w-full aspect-square rounded-2xl overflow-hidden">
                    <img src={nftData.imageUri} className='w-52 aspect-square bg-black/10 object-cover' alt="" />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1'>{nftData.name}</p>
                    <p>#{displayId}</p>
                </div>
                <div className="flex justify-end w-full">
                    <button
                        className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300'
                        onClick={openModalNFT}
                    >
                        <img src="./assets/qr.png" className='w-6 h-6 object-contain' alt="" />
                    </button>
                </div>
            </button>

            {/* ModalNFT */}
            {isModalNFTOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalNFT}></div>
                    <div className="bg-white rounded-3xl shadow-lg z-10 overflow-hidden p-3 relative">
                        <button
                            onClick={closeModalNFT}
                            className="px-4 py-2 hover:text-gray-300 absolute right-4 top-4"
                        >
                            X
                        </button>
                        <div ref={qrRef} className="bg-white p-4">
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={qrcodeLink}
                                viewBox={`0 0 256 256`}
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                            />
                        </div>
                        <div className="flex flex-col gap-5 p-5">
                            <div className="flex flex-col gap-1">
                                <p>#{displayId}</p>
                                <p className="text-xl font-bold">{nftData.name}</p>
                            </div>
                            <button
                                onClick={downloadQRCode}
                                className='bg-gradient-to-b from-black to-gray-800 text-white py-2 px-5 rounded-lg hover:scale-105 duration-300'
                            >
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTComponentNotClaimed;