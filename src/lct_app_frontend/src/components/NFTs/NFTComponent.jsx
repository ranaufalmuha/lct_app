import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { useAuth } from './../AuthContext';

export const NFTComponent = ({ NFTId, onTransferSuccess }) => {
    const { authenticatedActor } = useAuth();
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: './images/loadingImg.png'
    });
    const [recipientPrincipal, setRecipientPrincipal] = useState('');
    const [transferStatus, setTransferStatus] = useState('');

    const displayId = typeof NFTId === 'bigint' ? NFTId.toString() :
        Array.isArray(NFTId) ? Number(NFTId).toString() :
            String(NFTId);

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const response = await authenticatedActor.icrc7_token_metadata([NFTId]);

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
                        imageUri: imageUrl || './images/loadingImg.png'
                    });
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        if (NFTId !== undefined && authenticatedActor) {
            fetchNftData();
        }
    }, [NFTId, authenticatedActor]);

    const handleTransfer = async () => {
        if (!recipientPrincipal.trim()) {
            setTransferStatus('Please enter a recipient Principal ID');
            return;
        }

        try {
            let recipientPrincipalObj;
            try {
                recipientPrincipalObj = Principal.fromText(recipientPrincipal.trim());
            } catch (e) {
                setTransferStatus('Invalid Principal ID format');
                return;
            }

            const transferArgs = [{
                to: {
                    owner: recipientPrincipalObj,
                    subaccount: []
                },
                token_id: BigInt(NFTId),
                memo: [],
                from_subaccount: [],
                created_at_time: []
            }];

            const result = await authenticatedActor.icrc7_transfer(transferArgs);

            setTransferStatus('success');
            setRecipientPrincipal('');

            // Call the refresh function from props
            if (onTransferSuccess) {
                setTimeout(() => {
                    onTransferSuccess();
                }, 1000);
            }

            setTimeout(() => {
                closeModalNFT();
            }, 1000);

        } catch (error) {
            console.error('Transfer error:', error);
            setTransferStatus('Failed to transfer NFT');
        }
    };

    const openModalNFT = () => setIsModalNFTOpen(true);
    const closeModalNFT = () => {
        setIsModalNFTOpen(false);
        setTransferStatus('');
        setRecipientPrincipal('');
    };

    return (
        <div className="">
            <button className='bg-white shadow-lg shadow-black/20 rounded-2xl max-md:rounded-lg overflow-hidden flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default max-md:gap-3'>
                <div className="w-full aspect-square rounded-2xl max-md:rounded-xl overflow-hidden">
                    <img
                        src={nftData.imageUri}
                        className='w-full aspect-square bg-black/10'
                        alt=""
                        onError={(e) => {
                            e.target.src = './images/loadingImg.png';
                        }}
                    />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1 max-md:text-base'>{nftData.name}</p>
                    <p className='max-md:text-sm'>#{displayId}</p>
                </div>
                <div className="flex justify-end w-full">
                    <button className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300 max-md:rounded-md' onClick={openModalNFT}>
                        <img src="./assets/send.png" className='w-6 h-6 max-md:w-4 max-md:h-4 object-contain' alt="" />
                    </button>
                </div>
            </button>

            {isModalNFTOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalNFT}></div>
                    <div className="bg-white rounded-3xl shadow-lg z-10 overflow-hidden max-md:w-full md:w-3/4 max-w-[1000px] mx-5 p-3 max-h-5/6 relative">
                        <div className="flex max-lg:flex-col overflow-auto">
                            <button onClick={closeModalNFT} className="px-4 py-2 hover:text-gray-300 absolute right-4 top-4">X</button>
                            <img src={nftData.imageUri} className='w-1/2 max-lg:w-full aspect-square object-cover bg-black/10 rounded-2xl' alt="" />
                            <div className="w-1/2 max-lg:w-full p-5 flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <p>#{displayId}</p>
                                    <p className="text-xl font-bold">{nftData.name}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className='text-sm text-disabled'>Send NFT</p>
                                    <div className="flex gap-1">
                                        <input
                                            type="text"
                                            placeholder='Principal Id'
                                            value={recipientPrincipal}
                                            onChange={(e) => setRecipientPrincipal(e.target.value)}
                                            className='w-full border border-disabled rounded-lg px-3 py-1 text-sm'
                                        />
                                        <button
                                            onClick={handleTransfer}
                                            className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300'
                                        >
                                            <img src="./assets/send.png" className='w-6 h-6 object-contain' alt="" />
                                        </button>
                                    </div>
                                    {transferStatus && (
                                        <p className={`text-sm mt-2 ${transferStatus === 'success'
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                            }`}>
                                            {transferStatus === 'success'
                                                ? 'NFT transferred successfully!'
                                                : transferStatus}
                                        </p>
                                    )}
                                </div>
                                <div className=""></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTComponent;