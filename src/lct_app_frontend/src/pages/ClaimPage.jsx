
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/lct_app_backend/index.js";

export const ClaimPage = () => {
    const { nftid } = useParams();
    const { authenticatedActor, principal, logout } = useAuth();
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: '/images/loadingImg.png'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);


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
        console.log("ClaimPage mounted with:", {
            NFTId,
            hasAuthenticatedActor: !!authenticatedActor,
            principal,
        });
    }, []);

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

                const response = await actor.icrc7_token_metadata([NFTId]);
                console.log('Raw metadata response:', response);

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

                    console.log('Processed metadata:', metadataObj);

                    // Get the first key as name and its value as image URL
                    const [name] = Object.keys(metadataObj);
                    const imageUrl = metadataObj[name];

                    setNftData({
                        name: name || `NFT #${displayId}`,
                        imageUri: imageUrl || '/images/loadingImg.png'
                    });
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
            const result = await actor.claimNFT([NFTId]);
            console.log('Claim result:', result);

            if ('ok' in result) {
                setClaimSuccess(true);
                console.log('Successfully claimed NFT with transaction number:', result.ok);
            } else if ('err' in result) {
                setError(result.err);
                console.error('Failed to claim NFT:', result.err);
            }
        } catch (error) {
            console.error('Error claiming NFT:', error);
            setError('Failed to claim NFT. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (!authenticatedActor) return 'Initializing...';
        if (isLoading) return 'Claiming...';
        if (claimSuccess) return 'Claimed!';
        return 'Claim NFT';
    };

    const getButtonClass = () => {
        const baseClass = 'bg-gradient-to-b from-black via-black to-gray-800 duration-300 text-white py-2 px-5 rounded-lg';
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

    return (
        <main className='flex flex-col items-center gap-5 mt-5'>
            {/* header  */}
            <nav className='container '>
                <div className="flex items-center justify-between">
                    <div className="w-40 max-sm:w-4"></div>
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
            <div className="container max-w-[400px] p-3 flex flex-col gap-5">
                <img
                    src={nftData.imageUri}
                    alt={nftData.name}
                    className='rounded-xl w-full h-auto object-cover'
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
                    className={getButtonClass()}
                    onClick={handleClaimNFT}
                    disabled={!authenticatedActor || isLoading || claimSuccess}
                >
                    {getButtonText()}
                </button>
            </div>
        </main>
    );
};

export default ClaimPage;
