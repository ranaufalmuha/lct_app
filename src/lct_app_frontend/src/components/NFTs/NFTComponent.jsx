import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { useAuth } from './../AuthContext';

export const NFTComponent = ({ NFTId, onTransferSuccess, initialNftType = 'normal', initialShareholderDetails = null }) => {
    const { authenticatedActor, principal } = useAuth();
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: './images/loadingImg.png',
        nftType: initialNftType,
        shareholders: initialShareholderDetails?.shareholders || []
    });
    const [recipientPrincipal, setRecipientPrincipal] = useState('');
    const [transferStatus, setTransferStatus] = useState('');
    const [transferShares, setTransferShares] = useState('1');
    const [userShares, setUserShares] = useState(0);

    const displayId = typeof NFTId === 'bigint' ? NFTId.toString() :
        Array.isArray(NFTId) ? Number(NFTId).toString() :
            String(NFTId);


    useEffect(() => {
        const fetchNftData = async () => {
            try {
                // Fetch metadata
                const response = await authenticatedActor.icrc7_token_metadata([NFTId]);

                // Only fetch type and shareholders if not provided
                let nftTypeInfo = { nftType: initialNftType };
                let shareholderDetails = initialShareholderDetails;

                if (!initialNftType || !initialShareholderDetails) {
                    nftTypeInfo = await authenticatedActor.getNFTType(NFTId);

                    if (nftTypeInfo.nftType === 'fractional') {
                        const details = await authenticatedActor.getShareholderDetails(NFTId);
                        if ('ok' in details) {
                            shareholderDetails = details.ok;
                        }
                    }
                }

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

                    // Get user's shares if fractional using principal from AuthContext
                    let userShareAmount = 0;
                    if (shareholderDetails && principal) {
                        const userShare = shareholderDetails.shareholders.find(
                            sh => sh.owner.owner.toString() === principal.toString()
                        );
                        userShareAmount = userShare ? Number(userShare.shares) : 0;
                    }
                    setUserShares(userShareAmount);

                    setNftData({
                        name: name,
                        imageUri: imageUrl || './images/loadingImg.png',
                        nftType: nftTypeInfo.nftType,
                        shareholders: shareholderDetails?.shareholders || []
                    });
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        if (NFTId !== undefined && authenticatedActor) {
            fetchNftData();
        }
    }, [NFTId, authenticatedActor, initialNftType, initialShareholderDetails, principal]);

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

            if (nftData.nftType === 'fractional') {
                // Handle fractional transfer
                const sharesToTransfer = Number(transferShares);
                if (sharesToTransfer > userShares) {
                    setTransferStatus('Insufficient shares');
                    return;
                }

                const result = await authenticatedActor.transferShares(
                    NFTId,
                    {
                        owner: recipientPrincipalObj,
                        subaccount: []
                    },
                    sharesToTransfer
                );

                if ('ok' in result) {
                    setTransferStatus('success');
                    setRecipientPrincipal('');
                    if (onTransferSuccess) {
                        setTimeout(() => {
                            onTransferSuccess();
                        }, 1000);
                    }
                } else {
                    setTransferStatus(result.err);
                }
            } else {
                // Handle normal NFT transfer
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
                if (onTransferSuccess) {
                    setTimeout(() => {
                        onTransferSuccess();
                    }, 1000);
                }
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
        setTransferShares('1');
    };

    const formatSharePercentage = (shares, totalShares) => {
        return ((Number(shares) / Number(totalShares)) * 100).toFixed(2) + '%';
    };

    return (
        <div className="">
            <button
                className={`shadow-lg shadow-black/20 rounded-2xl max-md:rounded-lg overflow-hidden flex flex-col p-4 gap-4 hover:scale-105 duration-300 max-md:gap-3
                    ${nftData.nftType === 'fractional' ? 'bg-blue-100 hover:bg-blue-50' : 'bg-white'}`}
                onClick={openModalNFT}
            >
                <div className="w-full aspect-square rounded-2xl max-md:rounded-xl overflow-hidden">
                    <img
                        src={nftData.imageUri}
                        className='w-full aspect-square bg-black/10 object-cover'
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
                                    {nftData.nftType === 'fractional' && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <p className="font-medium">Fractional NFT</p>
                                            <p className="text-sm mt-1">Your Shares: {userShares}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className='text-sm text-disabled'>
                                        {nftData.nftType === 'fractional' ? 'Transfer Shares' : 'Send NFT'}
                                    </p>
                                    <div className="flex gap-1">
                                        <input
                                            type="text"
                                            placeholder='Principal Id'
                                            value={recipientPrincipal}
                                            onChange={(e) => setRecipientPrincipal(e.target.value)}
                                            className='w-full border border-disabled rounded-lg px-3 py-1 text-sm'
                                        />
                                        {nftData.nftType === 'fractional' && (
                                            <input
                                                type="number"
                                                placeholder="Shares"
                                                value={transferShares}
                                                onChange={(e) => setTransferShares(e.target.value)}
                                                min="1"
                                                max={userShares}
                                                className='w-24 border border-disabled rounded-lg px-3 py-1 text-sm'
                                            />
                                        )}
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
                                                ? nftData.nftType === 'fractional'
                                                    ? 'Shares transferred successfully!'
                                                    : 'NFT transferred successfully!'
                                                : transferStatus}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTComponent;