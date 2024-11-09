import React, { useEffect, useState } from 'react';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { NFTComponentAdmin } from '../../components/NFTs/NFTComponentAdmin';

const ListNft = () => {
    const [totalSupply, setTotalSupply] = useState(0);
    const [nftIds, setNftIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                setLoading(true);
                // Fetch all NFT IDs - passing empty arrays for start and limit to get all tokens
                const tokens = await lct_app_backend.icrc7_tokens([], []);
                console.log('Fetched NFT IDs:', tokens);

                // Update states
                setNftIds(tokens);
                setTotalSupply(tokens.length);
            } catch (err) {
                console.error('Error fetching NFTs:', err);
                setError('Failed to load NFTs');
                setTotalSupply(0);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, []);

    if (loading) {
        return (
            <div className="container flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container flex justify-center items-center min-h-[200px] text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className='container'>
            {/* NFTs List  */}
            <section className='flex justify-center mt-7 mb-14'>
                {totalSupply <= 0 ? (
                    <div className="flex justify-center w-full text-disabled">
                        <p>no nft minted</p>
                    </div>
                ) : (
                    <div className="container max-sm:p-4 grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full justify-items-center duration-300">
                        {/* Map through actual NFT IDs instead of dummy array */}
                        {nftIds.map((nftId, index) => (
                            <NFTComponentAdmin
                                key={index}
                                NFTId={Number(nftId)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ListNft;