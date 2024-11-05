import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { Principal } from '@dfinity/principal';
import { useAuth } from './../AuthContext';

const islocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "";
const DEFAULT_OWNER = islocalhost ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : process.env.CANISTER_ID_LCT_APP_BACKEND;

export const NFTComponentNotClaimed = ({ NFTId, qrcodeLink }) => {
    const { authenticatedActor } = useAuth();
    const [isModalNFTOpen, setIsModalNFTOpen] = useState(false);
    const [isModalFractionalOpen, setIsModalFractionalOpen] = useState(false);
    const [nftData, setNftData] = useState({
        name: 'Loading...',
        imageUri: './images/loadingImg.png',
        nftType: 'normal', // Add nftType state
        shareholders: [] // Add shareholders state
    });
    const qrRef = useRef(null);

    const displayId = typeof NFTId === 'bigint' ? NFTId.toString() :
        Array.isArray(NFTId) ? Number(NFTId).toString() :
            String(NFTId);

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                // Fetch metadata
                const response = await authenticatedActor.icrc7_token_metadata([NFTId]);
                // Fetch NFT type info
                const nftTypeInfo = await authenticatedActor.getNFTType(NFTId);

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

                    setNftData({
                        name: name,
                        imageUri: imageUrl,
                        nftType: nftTypeInfo.nftType,
                        shareholders: nftTypeInfo.shareholders || []
                    });
                }
            } catch (error) {
                console.error('Error fetching NFT data:', error);
            }
        };

        fetchNftData();
    }, [NFTId, displayId]);

    const [shareholderDetails, setShareholderDetails] = useState(null);

    // Function to fetch shareholder details
    const fetchShareholderDetails = async () => {
        if (nftData.nftType === 'fractional') {
            try {
                const details = await authenticatedActor.getShareholderDetails(NFTId);
                if ('ok' in details) {
                    setShareholderDetails(details.ok);
                } else {
                    console.error('Failed to fetch shareholder details:', details.err);
                }
            } catch (error) {
                console.error('Error fetching shareholder details:', error);
            }
        }
    };

    // Function to handle upgrading to fractional NFT
    const upgradeNFTtoFractional = async () => {
        try {
            // Check if can be made fractional
            const canMakeFractional = await authenticatedActor.canMakeFractional(NFTId);

            if (!canMakeFractional) {
                alert("This NFT cannot be made fractional. It must be owned by the canister first.");
                return;
            }

            // Show warning
            const confirmed = window.confirm(
                "Warning: Once you convert this NFT to a Fractional NFT, it cannot be converted back to a normal NFT. Do you want to continue?"
            );

            if (confirmed) {
                setIsModalFractionalOpen(true);
            }
        } catch (error) {
            console.error('Error checking fractional status:', error);
            alert('Error checking fractional status');
        }
    };

    // Function to submit fractional NFT creation
    const handleCreateFractional = async (owners, shares, totalShares) => {
        try {
            const response = await authenticatedActor.makeFractional(
                NFTId,
                owners.map(owner => ({
                    owner: owner.owner,
                    subaccount: [] // Use empty array instead of null
                })),
                shares,
                totalShares
            );

            if ('ok' in response) {
                alert('Successfully converted to Fractional NFT!');
                setIsModalFractionalOpen(false);
                window.location.reload();
            } else {
                alert('Failed to create fractional NFT: ' + response.err);
            }
        } catch (error) {
            console.error('Error creating fractional NFT:', error);
            alert('Failed to create fractional NFT: ' + error.message);
        }
    };

    const [downloadError, setDownloadError] = useState(null);

    // Modify the openModalNFT function to fetch details
    const openModalNFT = async () => {
        setIsModalNFTOpen(true);
        if (nftData.nftType === 'fractional') {
            await fetchShareholderDetails();
        }
    };

    // Function to format share percentage
    const formatSharePercentage = (shares, totalShares) => {
        // Convert BigInt to Number for calculation
        const sharesNum = typeof shares === 'bigint' ? Number(shares) : shares;
        const totalSharesNum = typeof totalShares === 'bigint' ? Number(totalShares) : totalShares;

        return ((sharesNum / totalSharesNum) * 100).toFixed(2) + '%';
    };

    // Function to find canister's shares
    const getCanisterShares = () => {
        if (!shareholderDetails) return 0n; // Return BigInt zero
        const canisterOwner = shareholderDetails.shareholders.find(
            sh => sh.owner.owner.toString() === DEFAULT_OWNER
        );
        return canisterOwner ? canisterOwner.shares : 0n;
    };

    const formatShares = (shares) => {
        return typeof shares === 'bigint' ? shares.toString() : shares;
    };

    function closeModalNFT() {
        setIsModalNFTOpen(false);
    }

    function closeModalFractional() {
        setIsModalFractionalOpen(false);
    }

    const downloadQRCode = () => {
        try {
            const svg = qrRef.current.querySelector('svg');
            if (!svg) {
                setDownloadError('QR Code not found');
                return;
            }

            // Create a new SVG with padding and background
            const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            wrapper.setAttribute('width', '1024');
            wrapper.setAttribute('height', '1024');
            wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            // Add white background
            const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            background.setAttribute('width', '1024');
            background.setAttribute('height', '1024');
            background.setAttribute('fill', 'white');
            wrapper.appendChild(background);

            // Clone the QR code SVG and scale it
            const qrCode = svg.cloneNode(true);
            qrCode.setAttribute('width', '800');
            qrCode.setAttribute('height', '800');
            qrCode.setAttribute('x', '112'); // Center horizontally: (1024 - 800) / 2
            qrCode.setAttribute('y', '112'); // Center vertically: (1024 - 800) / 2

            wrapper.appendChild(qrCode);

            // Convert to a data URL
            const svgData = new XMLSerializer().serializeToString(wrapper);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = svgDataUrl;
            downloadLink.download = `${nftData.name}_${displayId}_QRCode.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setDownloadError(null);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            setDownloadError('Failed to download QR code');
        }
    };

    const getQRCodeLink = () => {
        return qrcodeLink;
    };

    return (
        <div className="">
            <button
                className={`shadow-lg rounded-2xl flex flex-col p-4 gap-4 hover:scale-105 duration-300 cursor-default
                    ${nftData.nftType === 'fractional'
                        ? 'bg-blue-100 hover:bg-blue-50'
                        : 'bg-white'
                    }`}
            >
                <div className="w-full aspect-square rounded-2xl overflow-hidden">
                    <img src={nftData.imageUri} className='w-52 aspect-square bg-black/10 object-cover' alt="" />
                </div>
                <div className="w-full flex justify-between items-end">
                    <p className='w-4/5 text-xl font-bold text-start line-clamp-1'>{nftData.name}</p>
                    <p>#{displayId}</p>
                </div>
                <div className="flex justify-end gap-3 w-full">
                    {/* Only show upgrade button if NFT is not fractional */}
                    {nftData.nftType === 'normal' && (
                        <button
                            className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300'
                            onClick={upgradeNFTtoFractional}
                        >
                            <img src="./assets/upgrade_nft.png" className='w-6 h-6 object-contain' alt="" />
                        </button>
                    )}

                    {/* QR Code */}
                    <button
                        className='border border-disabled p-1 rounded-lg overflow-hidden hover:scale-105 duration-300'
                        onClick={openModalNFT}
                    >
                        <img src="./assets/qr.png" className='w-6 h-6 object-contain' alt="" />
                    </button>
                </div>
            </button>

            {/* QR Code Modal with modified content based on NFT type */}
            {isModalNFTOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center ">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalNFT}></div>
                    <div className="bg-white rounded-3xl shadow-lg z-10 p-3 relative max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
                        <button
                            onClick={closeModalNFT}
                            className="px-4 py-2 hover:text-gray-300 absolute right-4 top-4"
                        >
                            X
                        </button>

                        {/* Top Section with Basic Info */}
                        <div className="flex flex-col gap-1 mb-4 p-4">
                            <p>#{displayId}</p>
                            <p className="text-xl font-bold">{nftData.name}</p>
                        </div>

                        {/* QR Code Section */}
                        <div ref={qrRef} className="bg-white p-4">
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={getQRCodeLink()}
                                viewBox={`0 0 256 256`}
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                            />
                        </div>

                        {/* Download Button */}
                        <div className="p-4">
                            <button
                                onClick={downloadQRCode}
                                className={`w-full py-2 px-5 rounded-lg hover:scale-105 duration-300 text-white
                                bg-gradient-to-b from-black to-gray-800`}
                            >
                                Download QR
                            </button>
                        </div>

                        {/* Fractional NFT Details Section */}
                        {nftData.nftType === 'fractional' && shareholderDetails && (
                            <div className="p-4 mt-4">
                                <div className=" rounded-lg space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold">Fractional NFT Details</h4>
                                        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                                            Total Shares: {formatShares(shareholderDetails.totalShares)}
                                        </span>
                                    </div>

                                    {/* Canister's Share */}
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="text-sm font-medium">Canister's Share</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-bold">{formatShares(getCanisterShares())}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatSharePercentage(getCanisterShares(), shareholderDetails.totalShares)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Shareholders List */}
                                    <div className="space-y-2">
                                        <p className="font-medium">All Shareholders</p>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                            {shareholderDetails.shareholders.map((shareholder, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-2 rounded ${shareholder.owner.owner.toString() === DEFAULT_OWNER
                                                        ? 'bg-blue-100'
                                                        : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm truncate w-3/4">
                                                            {shareholder.owner.owner.toString()}
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {formatSharePercentage(shareholder.shares, shareholderDetails.totalShares)}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({formatShares(shareholder.shares)})
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                    </div>
                </div>
            )}

            {/* Fractional NFT Creation Modal */}
            {isModalFractionalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={closeModalFractional}></div>
                    <div className="bg-white rounded-3xl shadow-lg z-10 overflow-hidden p-6 relative min-w-[400px]">
                        <h3 className="text-xl font-bold mb-4">Create Fractional NFT</h3>
                        <FractionalNFTForm onSubmit={handleCreateFractional} onCancel={closeModalFractional} />
                    </div>
                </div>
            )}


        </div>
    );
};

export default NFTComponentNotClaimed;



const FractionalNFTForm = ({ onSubmit, onCancel }) => {
    const [totalShares, setTotalShares] = useState(1000); // Changed default to 1000 for more flexibility
    const [additionalOwners, setAdditionalOwners] = useState([]);
    const [defaultOwnerShares, setDefaultOwnerShares] = useState(1000); // Match total shares

    const addOwner = () => {
        setAdditionalOwners([...additionalOwners, { principal: '', shares: 0 }]);
    };

    const removeOwner = (index) => {
        const ownerToRemove = additionalOwners[index];
        setDefaultOwnerShares(prev => prev + Number(ownerToRemove.shares));
        setAdditionalOwners(additionalOwners.filter((_, i) => i !== index));
    };

    const updateOwnerShares = (index, newShares) => {
        const oldShares = additionalOwners[index]?.shares || 0;
        const shareDifference = Number(newShares) - Number(oldShares);

        if (defaultOwnerShares - shareDifference < 0) {
            alert("Not enough shares available from default owner");
            return;
        }

        const newOwners = [...additionalOwners];
        newOwners[index].shares = Number(newShares);
        setAdditionalOwners(newOwners);
        setDefaultOwnerShares(prev => prev - shareDifference);
    };

    const handleTotalSharesChange = (newTotal) => {
        const newTotalShares = Number(newTotal);
        if (newTotalShares < 1) return;

        // Calculate the ratio to maintain proportions
        const ratio = newTotalShares / totalShares;

        // Update all shares proportionally
        const newAdditionalOwners = additionalOwners.map(owner => ({
            ...owner,
            shares: Math.floor(owner.shares * ratio)
        }));

        // Set new total shares
        setTotalShares(newTotalShares);

        // Calculate new default owner shares
        const distributedShares = newAdditionalOwners.reduce((sum, owner) => sum + Number(owner.shares), 0);
        setDefaultOwnerShares(newTotalShares - distributedShares);
        setAdditionalOwners(newAdditionalOwners);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate total shares
            const distributedShares = additionalOwners.reduce((sum, owner) => sum + Number(owner.shares), 0);
            if (distributedShares + defaultOwnerShares !== totalShares) {
                alert("Share distribution doesn't match total shares");
                return;
            }

            // Convert principal strings to proper format with correct subaccount structure
            const allOwners = [
                {
                    owner: Principal.fromText(DEFAULT_OWNER),
                    subaccount: [] // Changed from null to empty array
                },
                ...additionalOwners.map(o => ({
                    owner: Principal.fromText(o.principal),
                    subaccount: [] // Changed from null to empty array
                }))
            ];

            const allShares = [defaultOwnerShares, ...additionalOwners.map(o => o.shares)];

            await onSubmit(allOwners, allShares, totalShares);
        } catch (error) {
            if (error.message.includes("Invalid principal")) {
                alert("Invalid principal format. Please check the principal IDs.");
            } else {
                alert(error.message);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total Shares Input */}
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Total Shares</h4>
                <input
                    type="number"
                    value={totalShares}
                    onChange={(e) => handleTotalSharesChange(e.target.value)}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    Higher number of shares allows for more precise distribution
                </p>
            </div>

            {/* Default Owner Section */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Default Owner</h4>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={DEFAULT_OWNER}
                        disabled
                        className="flex-1 p-2 border rounded bg-gray-100"
                    />
                    <input
                        type="number"
                        value={defaultOwnerShares}
                        disabled
                        className="w-24 p-2 border rounded bg-gray-100"
                    />
                    <div className="w-8"></div>
                </div>
            </div>

            {/* Additional Owners */}
            <div>
                <h4 className="font-semibold mb-2">Additional Owners</h4>
                {additionalOwners.map((owner, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Principal ID"
                            value={owner.principal}
                            onChange={(e) => {
                                const newOwners = [...additionalOwners];
                                newOwners[index].principal = e.target.value;
                                setAdditionalOwners(newOwners);
                            }}
                            className="flex-1 p-2 border rounded"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Shares"
                            value={owner.shares}
                            onChange={(e) => updateOwnerShares(index, e.target.value)}
                            className="w-24 p-2 border rounded"
                            required
                            min="1"
                            max={defaultOwnerShares + Number(owner.shares)}
                        />
                        <button
                            type="button"
                            onClick={() => removeOwner(index)}
                            className="px-2 text-red-500"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Share Distribution Info */}
            <div className="text-sm bg-gray-50 p-4 rounded-lg">
                <p>Total Shares: {totalShares}</p>
                <p>Default Owner Shares: {defaultOwnerShares} ({((defaultOwnerShares / totalShares) * 100).toFixed(2)}%)</p>
                <p>Distributed Shares: {totalShares - defaultOwnerShares} ({(((totalShares - defaultOwnerShares) / totalShares) * 100).toFixed(2)}%)</p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={addOwner}
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                    disabled={defaultOwnerShares === 0}
                >
                    Add Owner
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                    Create
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};