import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { NFTComponentNotClaimed } from '../../components/NFTs/NFTComponentNotClaimed';

const NotClaimed = () => {
    const islocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "";
    const [totalSupply, setTotalSupply] = useState(0);
    const backend_canister_principal = islocalhost ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : process.env.CANISTER_ID_LCT_APP_BACKEND;
    const fontend_canister_principal = islocalhost ? "bd3sg-teaaa-aaaaa-qaaba-cai" : process.env.CANISTER_ID_LCT_APP_FRONTEND;
    const [nftData, setNftData] = useState([]);

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                const owner = {
                    owner: Principal.fromText(backend_canister_principal),
                    subaccount: []
                };

                const start = [];
                const length = [];

                const tokens = await lct_app_backend.icrc7_tokens_of(owner, start, length);
                console.log("Fetched tokens:", tokens);

                // Filter NFTs based on type and ownership
                const filteredTokens = await Promise.all(
                    tokens.map(async (tokenId) => {
                        try {
                            // Get NFT type
                            const nftType = await lct_app_backend.getNFTType(tokenId);

                            if (nftType.nftType === 'normal') {
                                // If it's a normal NFT and owned by backend, include it
                                return tokenId;
                            } else if (nftType.nftType === 'fractional') {
                                // If it's fractional, check shares
                                const shareholderDetails = await lct_app_backend.getShareholderDetails(tokenId);

                                if ('ok' in shareholderDetails) {
                                    // Check if backend canister has shares
                                    const canisterShares = shareholderDetails.ok.shareholders.find(
                                        sh => sh.owner.owner.toString() === backend_canister_principal
                                    );

                                    // Only include fractional NFT if canister has shares
                                    if (canisterShares && Number(canisterShares.shares) > 0) {
                                        return tokenId;
                                    }
                                }
                            }
                            return null;
                        } catch (error) {
                            console.error(`Error checking NFT ${tokenId}:`, error);
                            return null;
                        }
                    })
                );

                // Remove null values and set the filtered data
                const validTokens = filteredTokens.filter(token => token !== null);
                setNftData(validTokens);
                setTotalSupply(validTokens.length);
                console.log("Filtered tokens:", validTokens);

            } catch (error) {
                console.error("Error fetching NFTs: ", error);
            }
        };

        fetchNftData();
    }, []);

    return (
        <div className='container'>
            <section className='flex justify-center mt-7'>
                {totalSupply <= 0 ? (
                    <div className="flex justify-center w-full text-disabled">
                        <p>no nft available for claiming</p>
                    </div>
                ) : (
                    <div className="container max-sm:p-4 grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full justify-items-center duration-300">
                        {nftData.map((tokenId, index) => (
                            <NFTComponentNotClaimed
                                key={index}
                                NFTId={tokenId}
                                qrcodeLink={`https://${fontend_canister_principal}.icp0.io/claim/${tokenId}`}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default NotClaimed;