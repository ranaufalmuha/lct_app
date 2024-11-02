import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useAuth } from './../../components/AuthContext';

export default function ICRC7MintForm() {
    const { authenticatedActor, principal: userPrincipal } = useAuth();
    const [ownerMode, setOwnerMode] = useState('default');
    const [customOwner, setCustomOwner] = useState('');
    const [formData, setFormData] = useState({
        tokenId: '',
        owner: 'lymfr-oqaaa-aaaao-qeucq-cai',
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

    const handleImg = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setStatus({
                loading: true,
                error: null,
                success: false
            });

            // Check file size - strict 1.5MB limit
            const maxFileSize = 1.5 * 1024 * 1024; // 1.5MB in bytes
            if (file.size > maxFileSize) {
                const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                setStatus({
                    loading: false,
                    error: `Maximum file size is 1.5MB. Your file: ${currentSizeMB}MB`,
                    success: false
                });
                // Clear input
                e.target.value = '';
                // Clear existing preview if any
                setFormData(prev => ({
                    ...prev,
                    imageUri: ''
                }));
                return;
            }

            // If size is okay, proceed with conversion
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                setFormData(prev => ({
                    ...prev,
                    imageUri: base64String
                }));

                setStatus({
                    loading: false,
                    error: null,
                    success: false
                });
            };

            reader.onerror = () => {
                setStatus({
                    loading: false,
                    error: 'Error reading file. Please try again.',
                    success: false
                });
                // Clear input and preview
                e.target.value = '';
                setFormData(prev => ({
                    ...prev,
                    imageUri: ''
                }));
            };

            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error:', error);
            setStatus({
                loading: false,
                error: 'Error processing file. Please try again.',
                success: false
            });
            // Clear input and preview
            e.target.value = '';
            setFormData(prev => ({
                ...prev,
                imageUri: ''
            }));
        }
    };

    const mintNFT = async (e) => {
        e.preventDefault();

        if (!authenticatedActor) {
            setStatus({
                loading: false,
                error: 'Not authenticated. Please wait...',
                success: false
            });
            return;
        }

        setStatus({ loading: true, error: null, success: false });

        try {
            const ownerPrincipal = Principal.fromText(formData.owner);

            // Updated mint argument structure to match Candid interface
            const mintArg = [{
                token_id: BigInt(formData.tokenId),
                owner: [{
                    owner: ownerPrincipal,
                    subaccount: [] // Empty array instead of null for opt vec nat8
                }],
                metadata: {
                    Class: [{
                        value: {
                            Text: formData.imageUri
                        },
                        name: formData.name,
                        immutable: true
                    }]
                },
                memo: [],
                created_at_time: [],
                override: true
            }];

            const result = await authenticatedActor.icrcX_mint(mintArg);

            if (result && Array.isArray(result) && result[0]) {
                if ('Ok' in result[0]) {
                    setStatus({
                        loading: false,
                        error: null,
                        success: true
                    });
                    setOwnerMode('default');
                    setFormData(prev => ({
                        ...prev,
                        tokenId: '',
                        imageUri: ''
                    }));
                } else if ('Err' in result[0]) {
                    throw new Error(JSON.stringify(result[0].Err));
                }
            }
        } catch (error) {
            console.error('Detailed minting error:', error);
            let errorMessage = error.message;

            if (error.message.includes('Reject code')) {
                errorMessage = 'Not authorized to mint. Please verify that you are a controller of the canister.';
            }

            setStatus({
                loading: false,
                error: `Minting failed: ${errorMessage}`,
                success: false
            });
        }
    };

    return (
        <main className='container mx-auto px-4 py-8'>
            <div className="max-w-[500px] w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Mint NFT</h2>

                    <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm">
                        <p>Auth Status: {authenticatedActor ? 'Authenticated' : 'Not Authenticated'}</p>
                        <p>User Principal: {userPrincipal || 'Not available'}</p>
                        <p>Canister Owner: {formData.owner}</p>
                    </div>

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
                                placeholder="Enter token ID (e.g., 0)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Owner Principal
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={ownerMode}
                                    onChange={(e) => setOwnerMode(e.target.value)}
                                    className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="default">Default Owner</option>
                                    <option value="custom">Custom Owner</option>
                                </select>

                                {ownerMode === 'custom' ? (
                                    <input
                                        type="text"
                                        value={customOwner}
                                        onChange={(e) => {
                                            setCustomOwner(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                owner: e.target.value
                                            }));
                                        }}
                                        placeholder="Enter custom owner principal"
                                        className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name="owner"
                                        disabled
                                        value={formData.owner}
                                        onChange={handleInputChange}
                                        className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent text-disabled bg-gray-50"
                                    />
                                )}
                            </div>

                            {ownerMode === 'custom' && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Make sure to enter a valid principal ID
                                </p>
                            )}
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
                                placeholder="Enter NFT name (e.g., Lost Toys)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image Upload
                            </label>
                            <input
                                type="file"
                                accept="image/*"  // Only accept image files
                                onChange={handleImg}
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                            {formData.imageUri && (
                                <div className="mt-2">
                                    <img
                                        src={formData.imageUri}
                                        alt="Preview"
                                        className="max-w-xs rounded-md"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status.loading || !authenticatedActor}
                            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {status.loading ? 'Minting...' : 'Mint NFT'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}