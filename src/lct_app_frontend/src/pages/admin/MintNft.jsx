import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { lct_app_backend } from 'declarations/lct_app_backend';

export default function ICRC7MintForm() {
    const [formData, setFormData] = useState({
        tokenId: '',
        owner: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
        imageUri: '',
        name: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const mintNFT = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            // Convert owner to Principal
            const ownerPrincipal = Principal.fromText(formData.owner);

            // Create memo as Uint8Array
            const memo = new Uint8Array([0x00, 0x01]);

            // Construct the mint argument exactly matching the candid structure
            const mintArg = [{
                token_id: BigInt(formData.tokenId),
                owner: [{
                    owner: ownerPrincipal,
                    subaccount: [] // null in Candid becomes empty array
                }],
                metadata: {
                    Class: [{
                        value: { Text: formData.imageUri },
                        name: formData.name,
                        immutable: true
                    }]
                },
                memo: [memo],
                override: true,
                created_at_time: []  // null in Candid becomes empty array
            }];

            const result = await lct_app_backend.icrcX_mint(mintArg);
            console.log('Mint result:', result);

            setStatus({
                loading: false,
                error: null,
                success: true
            });

            // Reset form
            setFormData({
                tokenId: '',
                owner: '',
                imageUri: '',
                name: 'icrc7:metadata:uri:image'
            });

        } catch (error) {
            console.error('Minting error:', error);
            setStatus({
                loading: false,
                error: error.message || 'Failed to mint NFT',
                success: false
            });
        }
    };

    return (
        <div className="max-w-[500px] w-full mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Mint NFT</h2>

                {status.error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                        {status.error}
                    </div>
                )}

                {status.success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
                        NFT minted successfully!
                    </div>
                )}

                <form onSubmit={mintNFT} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Token ID
                        </label>
                        <input
                            type="number"
                            name="tokenId"
                            value={formData.tokenId}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                            required
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Owner Principal
                        </label>
                        <input
                            type="text"
                            name="owner"
                            disabled
                            value={formData.owner}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent text-disabled"
                            required
                            placeholder="Enter principal ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            NFT Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                            required
                            placeholder="Enter principal ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image URI
                        </label>
                        <input
                            type="text"
                            name="imageUri"
                            value={formData.imageUri}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                            required
                            placeholder="Enter image URL"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {status.loading ? 'Minting...' : 'Mint NFT'}
                    </button>
                </form>
            </div>
        </div>
    );
}