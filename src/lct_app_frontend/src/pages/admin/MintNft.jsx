import React, { useState } from 'react';
import { Principal } from '@dfinity/principal'; // Mengimpor Principal dari DFINITY SDK
import { lct_app_backend } from 'declarations/lct_app_backend';

const MintNft = () => {
    const [tokenId, setTokenId] = useState('');
    const [owner, setOwner] = useState('');
    const [metadata, setMetadata] = useState('');
    const [mintResponse, setMintResponse] = useState(null);

    const mintNFT = async () => {
        try {
            // Convert Owner to Principal
            const ownerPrincipal = Principal.fromText(owner);
            const metadataValue = metadata; // Mengambil input metadata

            const response = await lct_app_backend.icrcX_mint([
                {
                    token_id: Number(tokenId),
                    owner: { owner: ownerPrincipal, subaccount: null }, // Mengatur subaccount menjadi null
                    metadata: { Text: metadataValue }, // Mengatur metadata sesuai input
                    memo: null,
                    override: false,
                    created_at_time: null,
                }
            ]);

            setMintResponse(response); // Menyimpan hasil respons
        } catch (error) {
            console.error('Error minting NFT:', error);
            setMintResponse({ error: 'Failed to mint NFT' });
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
                    <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="princ-cipal" />
                </div>
                <div class="mb-6">
                    <label for="text" class="block mb-2 text-sm font-medium text-gray-900 ">Metadata (Text)</label>
                    <input type="text" value={metadata} onChange={(e) => setMetadata(e.target.value)} required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="variant { Class = vec { ..." />
                </div>
                <button onClick={mintNFT} class="text-white bg-black hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Mint NFT</button>
            </form>

            {/* ------  */}


        </div>
    );
};

export default MintNft;
