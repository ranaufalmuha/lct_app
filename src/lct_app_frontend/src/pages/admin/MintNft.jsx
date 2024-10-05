import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { lct_app_backend } from 'declarations/lct_app_backend';

const MintNft = () => {
    const [tokenId, setTokenId] = useState('');
    const [owner, setOwner] = useState('4n567-xaaaa-aaaai-qpk3a-cai');
    const [imageUri, setImageUri] = useState("https://i.ytimg.com/vi/oBUpJ4CqmN0/maxresdefault.jpg");

    const mintNFT = async () => {
        try {
            // Convert Owner to Principal
            const ownerPrincipal = Principal.fromText(owner);

            // Step 3: Prepare the arguments for the mint function
            const mintArgs = [
                [
                    {
                        token_id: BigInt(tokenId),
                        owner: [
                            {
                                owner: ownerPrincipal,
                                subaccount: null,
                            }
                        ],
                        metadata: {
                            Class: [
                                {
                                    value: {
                                        Text: imageUri
                                    },
                                    name: "icrc7:metadata:uri:image",
                                    immutable: true
                                }
                            ]
                        },
                        memo: ["\x00\x01"],
                        override: true,
                        created_at_time: null
                    }
                ]
            ];

            const response = await lct_app_backend.icrcX_mint(mintArgs);

            console.log(response);
        } catch (error) {
            console.error('Error minting NFT:', error);
        }
    };

    return (
        <div className='container'>
            {/* -------- */}

            <form className='p-7'>
                <div className='mb-4'>
                    <label for="text" class="block mb-2 text-sm font-medium text-gray-900">NFT Id</label>
                    <input type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-24" placeholder="0" />
                </div>
                <div class="mb-4">
                    <label for="text" class="block mb-2 text-sm font-medium text-gray-900 ">Owner Principal</label>
                    <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="principal" />
                </div>
                <div class="mb-6">
                    <label for="text" class="block mb-2 text-sm font-medium text-gray-900 ">Image Uri</label>
                    <input type="text" value={imageUri} onChange={(e) => setImageUri(e.target.value)} required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="variant { Class = vec { ..." />
                </div>
                <button onClick={mintNFT} class="text-white bg-black hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Mint NFT</button>
            </form>

            {/* ------  */}


        </div>
    );
};

export default MintNft;
