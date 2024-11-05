import React, { useState, useEffect } from 'react';
import { lct_app_backend } from 'declarations/lct_app_backend';

export const NFTComponentAdmin = ({ NFTId }) => {
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: './images/loadingImg.png',
        nftType: 'normal', // Add nftType state
        shareholders: [] // Add shareholders state
    });

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const response = await lct_app_backend.icrc7_token_metadata([NFTId]);
                const nftTypeInfo = await lct_app_backend.getNFTType(NFTId);

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

                    setNftData({
                        name: name,
                        imageUri: imageUrl || "./images/loadingImg.png",
                        nftType: nftTypeInfo.nftType,
                        shareholders: nftTypeInfo.shareholders || []
                    });

                    console.log(nftData.shareholders);
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        if (NFTId !== undefined) {
            fetchNftData();
        }
    }, [NFTId]);

    return (
        <div className="">
            <button className={`shadow-lg shadow-black/20 rounded-2xl max-md:rounded-lg overflow-hidden flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default max-md:gap-3 ${nftData.nftType === 'fractional'
                ? 'bg-blue-100 hover:bg-blue-50'
                : 'bg-white'
                }`}>
                <div className="w-full aspect-square rounded-2xl max-md:rounded-xl overflow-hidden">
                    <img
                        src={nftData.imageUri}
                        className='w-52 aspect-square bg-black/10 object-cover'
                        alt={nftData.name}
                    />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1 max-md:text-base'>
                        {nftData.name}
                    </p>
                    <p className='max-md:text-sm'>#{NFTId}</p>
                </div>
            </button>
        </div>
    );
};

export default NFTComponentAdmin;