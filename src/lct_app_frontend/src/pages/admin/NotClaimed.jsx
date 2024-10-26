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
                setNftData(tokens);
                setTotalSupply(tokens.length);
                console.log("Fetched tokens:", tokens);
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
                        <p>no nft minted</p>
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