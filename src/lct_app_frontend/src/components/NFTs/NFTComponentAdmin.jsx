import React, { useState, useEffect } from 'react';
import { lct_app_backend } from 'declarations/lct_app_backend';

export const NFTComponentAdmin = ({ NFTId }) => {
    const [NFTName, setNFTName] = useState("Loading...");
    const [nftImage, setNftImage] = useState("./images/loadingImg.png");

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

                    // Get the first key as name and its value as image URL
                    const [name] = Object.keys(metadataObj);
                    const imageUrl = metadataObj[name];

                    setNFTName(name);
                    setNftImage(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        if (NFTId !== undefined) {
            fetchNftData();
        }
    }, [NFTId]);

    function openModalNFT() {
        setIsModalNFTOpen(true);
    }

    function closeModalNFT() {
        setIsModalNFTOpen(false);
    }

    return (
        <div className="">
            <button className='bg-white shadow-lg shadow-black/20 rounded-2xl max-md:rounded-lg overflow-hidden flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default max-md:gap-3'>
                <div className="w-full aspect-square rounded-2xl max-md:rounded-xl overflow-hidden">
                    <img
                        src={nftImage}
                        className='w-52 aspect-square bg-black/10'
                        alt={NFTName}
                        onError={() => setNftImage("./images/loadingImg.png")}
                    />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1 max-md:text-base'>
                        {NFTName}
                    </p>
                    <p className='max-md:text-sm'>#{NFTId}</p>
                </div>
            </button>
        </div>
    );
};

export default NFTComponentAdmin;