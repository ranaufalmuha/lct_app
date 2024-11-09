
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/lct_app_backend/index.js";

const islocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "";
const CANISTER_OWNER = islocalhost ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : process.env.CANISTER_ID_LCT_APP_BACKEND;

export const ClaimPage = () => {
    const { nftid } = useParams();
    const { authenticatedActor, principal, logout } = useAuth();
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: '/images/loadingImg.png',
        nftType: 'normal',
        shareholders: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    // F-NFT 
    const [nftType, setNftType] = useState('normal');
    const [shareholderDetails, setShareholderDetails] = useState(null);


    const NFTId = Number(nftid);
    const displayId = String(NFTId);

    // Ensure we have a valid actor
    const ensureActor = async () => {
        if (!authenticatedActor && principal) {
            try {
                const identity = await window.ic?.plug?.sessionManager.sessionData.identity;
                if (!identity) {
                    throw new Error('No identity available');
                }

                const agent = new HttpAgent({
                    identity,
                    host: "https://icp-api.io"
                });

                const newActor = Actor.createActor(idlFactory, {
                    agent,
                    canisterId: process.env.CANISTER_ID_LCT_APP_BACKEND
                });

                return newActor;
            } catch (err) {
                console.error('Error creating actor:', err);
                return null;
            }
        }
        return authenticatedActor;
    };

    useEffect(() => {
        const fetchNftData = async () => {
            if (fetchingData) return;

            const actor = await ensureActor();
            if (!actor) {
                console.log('No authenticated actor available');
                return;
            }

            try {
                setFetchingData(true);
                console.log('Fetching NFT data for ID:', NFTId);

                // Fetch metadata
                const response = await actor.icrc7_token_metadata([NFTId]);
                // Fetch NFT type info
                const nftTypeInfo = await actor.getNFTType(NFTId);

                if (response && response[0] && response[0][0]) {
                    const metadataEntries = response[0][0];
                    const metadataObj = {};

                    metadataEntries.forEach(entry => {
                        if (Array.isArray(entry) && entry.length === 2) {
                            const [key, value] = entry;
                            if (value && typeof value === 'object') {
                                if ('Text' in value) {
                                    metadataObj[key] = value.Text;
                                } else if ('Nat' in value) {
                                    metadataObj[key] = value.Nat.toString();
                                } else if ('Int' in value) {
                                    metadataObj[key] = value.Int.toString();
                                }
                            }
                        }
                    });

                    const [name] = Object.keys(metadataObj);
                    const imageUrl = metadataObj[name];

                    // If it's a fractional NFT, fetch shareholder details
                    let shareholderInfo = null;
                    if (nftTypeInfo.nftType === 'fractional') {
                        const details = await actor.getShareholderDetails(NFTId);
                        if ('ok' in details) {
                            shareholderInfo = details.ok;
                        }
                    }

                    setNftData({
                        name: name || `NFT #${displayId}`,
                        imageUri: imageUrl || '/images/loadingImg.png',
                        nftType: nftTypeInfo.nftType,
                        shareholders: nftTypeInfo.shareholders || []
                    });
                    setShareholderDetails(shareholderInfo);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching NFT data:', err);
                setError(`Failed to fetch NFT data. Please try again.`);
            } finally {
                setFetchingData(false);
            }
        };

        fetchNftData();
    }, [NFTId, authenticatedActor, principal]);

    const formatSharePercentage = (shares, totalShares) => {
        const sharesNum = typeof shares === 'bigint' ? Number(shares) : shares;
        const totalSharesNum = typeof totalShares === 'bigint' ? Number(totalShares) : totalShares;
        return ((sharesNum / totalSharesNum) * 100).toFixed(2) + '%';
    };

    // Format shares for display
    const formatShares = (shares) => {
        return typeof shares === 'bigint' ? shares.toString() : shares;
    };

    const handleClaimNFT = async () => {
        const actor = await ensureActor();
        if (!actor) {
            setError('Please ensure you are properly authenticated');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            console.log('Attempting to claim NFT:', NFTId);
            console.log('NFT Type:', nftData.nftType);

            if (nftData.nftType === 'fractional') {
                // For Fractional NFTs
                if (shareholderDetails) {
                    // Debug logs
                    console.log('Shareholder Details:', shareholderDetails);
                    console.log('Shareholders:', shareholderDetails.shareholders);

                    // Find canister owner's shares
                    const canisterOwner = shareholderDetails.shareholders.find(
                        sh => {
                            const ownerString = sh.owner.owner.toString();
                            console.log('Comparing owner:', ownerString, 'with CANISTER_OWNER:', CANISTER_OWNER);
                            return ownerString === CANISTER_OWNER;
                        }
                    );

                    console.log('Canister Owner found:', canisterOwner);

                    if (!canisterOwner) {
                        setError('Canister owner not found in shareholders');
                        return;
                    }

                    // Convert shares to number if it's BigInt
                    const shares = typeof canisterOwner.shares === 'bigint'
                        ? Number(canisterOwner.shares)
                        : canisterOwner.shares;

                    console.log('Canister shares:', shares);

                    if (shares <= 0) {
                        setError('No shares available to claim from canister');
                        return;
                    }

                    // Handle fractional claim
                    const result = await actor.claimFractionalNFT([NFTId]);
                    console.log('Fractional claim result:', result);

                    if ('ok' in result) {
                        setClaimSuccess(true);
                        console.log('Successfully claimed Fractional NFT shares:', result.ok);
                    } else if ('err' in result) {
                        setError(result.err);
                        console.error('Failed to claim Fractional NFT:', result.err);
                    }
                } else {
                    setError('Unable to fetch share details');
                }
            } else {
                // For Normal NFTs - existing logic
                const result = await actor.claimNFT([NFTId]);
                console.log('Normal NFT claim result:', result);

                if ('ok' in result) {
                    setClaimSuccess(true);
                    console.log('Successfully claimed NFT with transaction number:', result.ok);
                } else if ('err' in result) {
                    setError(result.err);
                    console.error('Failed to claim NFT:', result.err);
                }
            }
        } catch (error) {
            console.error('Error claiming NFT:', error);
            setError(`Failed to claim ${nftData.nftType === 'fractional' ? 'Fractional ' : ''}NFT. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this debug function to your component
    useEffect(() => {
        if (shareholderDetails) {
            console.log('Current shareholderDetails:', shareholderDetails);
            console.log('Shareholders:', shareholderDetails.shareholders.map(sh => ({
                owner: sh.owner.owner.toString(),
                shares: Number(sh.shares)
            })));
        }
    }, [shareholderDetails]);

    // Update the getButtonText function
    const getButtonText = () => {
        if (!authenticatedActor) return 'Initializing...';
        if (isLoading) return 'Claiming...';
        if (claimSuccess) return 'Claimed!';
        return nftData.nftType === 'fractional' ? 'Claim Fractional NFT' : 'Claim NFT';
    };

    // Update the getButtonClass function
    const getButtonClass = () => {
        const baseClass = `duration-300 text-white py-2 px-5 rounded-lg bg-black`;

        if (!authenticatedActor || isLoading) return `${baseClass} opacity-50 cursor-not-allowed`;
        if (claimSuccess) return `${baseClass} bg-green-500 cursor-default`;
        return `${baseClass} hover:scale-105`;
    };


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

    const getSuccessMessage = () => {
        if (!claimSuccess) return null;

        return nftData.nftType === 'fractional' ? (
            <div className="text-green-500 text-sm text-center">
                Fractional NFT shares claimed successfully!
                <div className="text-xs mt-1">
                    Check your wallet for your share allocation.
                </div>
            </div>
        ) : (
            <div className="text-green-500 text-sm text-center">
                NFT claimed successfully!
            </div>
        );
    };

    return (
        <main className='flex flex-col items-center gap-5 mt-5'>
            {/* header  */}
            <nav className='container px-6'>
                <div className="flex items-center justify-between">
                    <a href='/' className="w-40 max-sm:w-4">
                        <img src="./assets/back.png" className='w-4 aspect-square object-contain' alt="" />
                    </a>
                    <a href='/' className="flex justify-center items-center">
                        <img src="./images/logo-full-black.png" className='w-7' alt="" />
                        <p className='text-center'>Lost Club Toys</p>
                    </a>
                    <div className="flex gap-2 items-center">
                        <button onClick={copyToClipboard} className='w-36 text-disabled hover:text-white  relative line-clamp-1 text-sm max-sm:hidden py-1 px-1  border border-disabled hover:border-white rounded-md duration-300 leading-6'>{principal}</button>
                        <button onClick={handleLogout}><img src="./assets/logout.png" alt="" className='w-4 aspect-square' /></button>
                    </div>

                </div>
            </nav>
            <div className={`container max-w-[400px] flex flex-col gap-5  rounded-xl px-6`}>
                <img
                    src={nftData.imageUri}
                    alt={nftData.name}
                    className='rounded-xl w-full h-auto aspect-square object-cover'
                    onError={(e) => {
                        e.target.src = '/images/loadingImg.png';
                        console.log('Image failed to load, using fallback');
                    }}
                />

                <div className="flex justify-between gap-5">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1'>
                        {nftData.name}
                    </p>
                    <p>#{displayId}</p>
                </div>

                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {claimSuccess && (
                    <div className="text-green-500 text-sm text-center">
                        NFT claimed successfully!
                    </div>
                )}

                <button
                    className={`${getButtonClass()}`}
                    onClick={handleClaimNFT}
                    disabled={!authenticatedActor || isLoading || claimSuccess}
                >
                    {nftData.nftType === 'fractional' ? 'Claim Fractional NFT' : getButtonText()}
                </button>

                {nftData.nftType === 'fractional' && (
                    <p className="text-sm text-gray-500 text-center">
                        This is a Fractional NFT. You will receive your share of the NFT after claiming.
                    </p>
                )}

                {/* Fractional NFT Details */}
                {nftData.nftType === 'fractional' && shareholderDetails && (
                    <div className="bg-white rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-black">Fractional NFT</h4>
                            <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                                Total Shares: {formatShares(shareholderDetails.totalShares)}
                            </span>
                        </div>

                        {/* Shareholders List */}
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Share Distribution:</p>
                            <div className="max-h-40 overflow-y-auto space-y-3">
                                {shareholderDetails.shareholders.map((shareholder, index) => (
                                    <div key={index} className="p-2 rounded bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm truncate w-3/4">
                                                {shareholder.owner.owner.toString()}
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatSharePercentage(shareholder.shares, shareholderDetails.totalShares)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </main>
    );
};

export default ClaimPage;
