import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NFTComponent } from '../components/NFTs/NFTComponent';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

const idlFactory = ({ IDL }) => {
    const Account = IDL.Record({
        'owner': IDL.Principal,
        'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8))
    });

    const TransferArgs = IDL.Record({
        'to': Account,
        'fee': IDL.Opt(IDL.Nat),
        'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'created_at_time': IDL.Opt(IDL.Nat64),
        'amount': IDL.Nat
    });

    const TransferError = IDL.Variant({
        'GenericError': IDL.Record({ 'message': IDL.Text, 'error_code': IDL.Nat }),
        'TemporarilyUnavailable': IDL.Null,
        'BadBurn': IDL.Record({ 'min_burn_amount': IDL.Nat }),
        'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
        'BadFee': IDL.Record({ 'expected_fee': IDL.Nat }),
        'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
        'TooOld': IDL.Null,
        'InsufficientFunds': IDL.Record({ 'balance': IDL.Nat })
    });

    return IDL.Service({
        'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
        'icrc1_transfer': IDL.Func([TransferArgs], [IDL.Variant({ 'Ok': IDL.Nat, 'Err': TransferError })], [])
    });
};

function Home() {
    const { authenticatedActor, principal, logout } = useAuth();
    const [totalSupply, setTotalSupply] = useState(0);
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ title: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [nftData, setNftData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState('idle');

    // states for ICP Token
    const [icpBalance, setIcpBalance] = useState(0);
    const [recipientPrincipal, setRecipientPrincipal] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isTransferring, setIsTransferring] = useState(false);
    const [showAlertToken, setShowAlertToken] = useState(false);
    const [alertMessageToken, setAlertMessageToken] = useState({ type: '', message: '' });

    // Create ledger actor
    const createLedgerActor = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();

            const agent = new HttpAgent({
                identity,
                host: "https://icp-api.io" // Changed from ic0.app to icp-api.io
            });

            // Create actor with the correct IDL factory
            return Actor.createActor(idlFactory, {
                agent,
                canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
            });
        } catch (error) {
            console.error("Error creating ledger actor:", error);
            throw error;
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Fetch balance
    const fetchBalance = async () => {
        if (!principal) return;

        try {
            setIsLoadingToken(true);
            const ledgerActor = await createLedgerActor();
            const balance = await ledgerActor.icrc1_balance_of({
                owner: Principal.fromText(principal),
                subaccount: []
            });
            setIcpBalance(Number(balance) / 100_000_000);
        } catch (error) {
            console.error("Error fetching balance:", error);
            showNotificationToken('error', 'Failed to fetch balance');
        } finally {
            setIsLoadingToken(false);
        }
    };

    // Handle transfer
    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!recipientPrincipal || !amount) {
            showNotificationToken('error', 'Please fill in all fields');
            return;
        }

        try {
            setIsTransferring(true);
            const ledgerActor = await createLedgerActor();

            let recipient;
            try {
                recipient = Principal.fromText(recipientPrincipal);
            } catch (e) {
                throw new Error('Invalid recipient principal');
            }

            const amountE8s = BigInt(Math.floor(parseFloat(amount) * 100_000_000));
            const fee = 10_000n;

            const result = await ledgerActor.icrc1_transfer({
                to: {
                    owner: recipient,
                    subaccount: []
                },
                fee: [fee],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                amount: amountE8s
            });

            if ('Ok' in result) {
                showNotificationToken('success', `Successfully transferred ${amount} ICP`);
                setRecipientPrincipal('');
                setAmount('');
                fetchBalance();
            } else {
                throw new Error(JSON.stringify(result.Err));
            }
        } catch (error) {
            console.error('Transfer error:', error);
            showNotificationToken('error', error.message);
        } finally {
            setIsTransferring(false);
        }
    };

    const showNotificationToken = (type, message) => {
        setAlertMessageToken({ type, message });
        setShowAlertToken(true);
        setTimeout(() => setShowAlertToken(false), 3000);
    };

    // Fetch user's balance
    const fetchNftData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch NFT data
            const tokens = await authenticatedActor.icrc7_tokens_of({
                owner: Principal.fromText(principal),
                subaccount: []
            }, [], []);
            setNftData(tokens);
            setTotalSupply(tokens.length);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [principal, authenticatedActor]);



    useEffect(() => {
        if (principal) {
            fetchNftData();
            fetchBalance();
            const interval = setInterval(fetchBalance, 10000);
            return () => clearInterval(interval);
        }

    }, [principal]);

    const copyToClipboard = async () => {
        if (!principal) return;

        setCopyStatus('pending');
        try {
            await navigator.clipboard.writeText(principal);
            setAlertMessage({
                title: 'Copy Successfully',
                message: `Copied: ${principal}`
            });
            setShowAlert(true);
            setCopyStatus('success');
        } catch (err) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = principal;
                textArea.style.position = 'fixed';  // Avoid scrolling to bottom
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    setAlertMessage({
                        title: 'Copy Successfully',
                        message: `Copied: ${principal}`
                    });
                    setShowAlert(true);
                    setCopyStatus('success');
                } else {
                    throw new Error('Copy command failed');
                }
            } catch (err) {
                console.error('Failed to copy:', err);
                setAlertMessage({
                    title: 'Copy Failed',
                    message: 'Please try again or copy manually'
                });
                setShowAlert(true);
                setCopyStatus('error');
            }
        } finally {
            // Reset status and hide alert after delay
            setTimeout(() => {
                setShowAlert(false);
                setCopyStatus('idle');
            }, 1500);
        }
    };

    const formatBalance = (balance) => {
        if (balance <= 0) return "0.0";
        const [int, dec] = balance.toString().split('.');
        if (!dec) return int;
        const trimmedDec = dec.slice(0, 6).replace(/0+$/, '');
        return trimmedDec ? `${int}.${trimmedDec}` : int;
    };

    return (
        <main className='duration-300'>
            {/* Main content */}
            <section className='h-[45vh] min-h-[400px] bg-black/85 text-white p-6 flex flex-col relative'>
                <img src="./images/LostClubToys.jpg" className='absolute left-0 top-0 -z-10 h-full w-full object-cover grayscale' alt="" />
                {/* header  */}
                <div className="flex items-center justify-between">
                    <div className="w-40 max-sm:w-4 "></div>
                    <a href='/' className="flex justify-center items-center">
                        <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                        <p className='text-center'>Lost Club Toys</p>
                    </a>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={copyToClipboard}
                            disabled={copyStatus === 'pending'}
                            className={`w-36 text-disabled hover:text-white relative line-clamp-1 text-sm max-sm:hidden py-1 px-1 border border-disabled hover:border-white rounded-md duration-300 leading-6 ${copyStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {principal}
                        </button>
                        <button onClick={handleLogout}>
                            <img src="./assets/logout.png" alt="" className='w-4 aspect-square' />
                        </button>
                    </div>
                </div>

                {/* Mid Content  */}
                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <div className='flex flex-col items-center gap-2 '>
                        <div className="flex items-center gap-3">
                            <img src="./images/icp_logo.png" className='max-sm:h-12 h-14 object-contain p-3 bg-white max-sm:rounded-lg rounded-xl duration-300' alt="" />
                            {isLoadingToken ? (
                                <div className="animate-pulse">
                                    <div className="max-sm:h-10 h-12 bg-disabled rounded w-full"></div>
                                </div>
                            ) : (
                                <p className='max-sm:text-4xl text-5xl duration-300'>{formatBalance(icpBalance)}</p>
                            )}
                            {/* <p className='text-8xl'>{totalSupply}</p> */}
                        </div>
                        <p className='text-disabled max-sm:text-sm duration-300'>Available Balance</p>
                        {/* <p>NFTs</p> */}
                    </div>
                </div>

                {/* Button Received */}
                <div className="flex justify-center gap-5">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="text-disabled border border-disabled rounded-lg duration-300 hover:scale-110"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img src="./assets/add.png" className='aspect-square p-3 w-12' alt="" />
                        </button>
                        <p className='text-disabled text-sm'>Received</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <button
                            className="text-disabled border border-disabled rounded-lg duration-300 hover:scale-110"
                            onClick={() => setIsSendModalOpen(true)}
                        >
                            <img src="./assets/send.png" className='aspect-square p-3 w-12' alt="" />
                        </button>
                        <p className='text-disabled text-sm'>Send</p>
                    </div>
                </div>
            </section>

            {/* NFTs  */}
            <section className='flex justify-center mt-5'>
                {isLoading ? (
                    <div className="flex justify-center w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : totalSupply <= 0 ? (
                    <div className="flex justify-center w-full text-disabled">
                        <p>you don't have any nft</p>
                    </div>
                ) : (
                    <div className="container max-sm:p-4 grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full justify-items-center duration-300">
                        {nftData.map((tokenId) => (
                            <NFTComponent
                                key={tokenId.toString()}
                                NFTId={tokenId}
                                onTransferSuccess={fetchNftData}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center duration-300 transition-opacity">
                    <div className="fixed inset-0 bg-black opacity-50 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white p-6 m-6 rounded-lg shadow-lg z-10 transition-opacity">
                        <p className="text-xl font-bold mb-4">Principal ID</p>
                        <div className="flex flex-col">
                            <button
                                onClick={copyToClipboard}
                                disabled={copyStatus === 'pending'}
                                className={`hover:text-gray-800 text-disabled text-sm py-2 px-4 border hover:border-gray-800 border-disabled rounded-md duration-300 flex gap-2 items-center ${copyStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <img src="./assets/copy.png" className='w-5 aspect-square object-cover' alt="" />
                                <p>{principal}</p>
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="mt-4 px-4 py-2 bg-gradient-to-b from-black via-black to-gray-800 text-white rounded hover:bg-gradient-to-r duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send ICP Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsSendModalOpen(false)}></div>
                    <div className="bg-white p-6 m-6 rounded-lg shadow-lg z-10 w-96">
                        <h2 className="text-xl font-bold mb-4">Send ICP</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Recipient Principal</label>
                                <input
                                    type="text"
                                    value={recipientPrincipal}
                                    onChange={(e) => setRecipientPrincipal(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3"
                                    placeholder="Enter recipient principal ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount (ICP)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3"
                                    placeholder="0.00"
                                    step="0.00000001"
                                    min="0"
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                Fee: 0.0001 ICP
                            </div>
                            <button
                                onClick={handleTransfer}
                                disabled={isTransferring}
                                className={`w-full px-4 py-2 bg-gradient-to-b from-black via-black to-gray-800 text-white rounded hover:bg-gradient-to-r duration-300 ${isTransferring ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isTransferring ? 'Sending...' : 'Send ICP'}
                            </button>
                            <button
                                onClick={() => setIsSendModalOpen(false)}
                                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert */}
            {showAlertToken && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${alertMessageToken.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    <p className="text-sm font-medium">{alertMessageToken.message}</p>
                </div>
            )}

            {/* Alert */}
            <div
                className={`${showAlert ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-500 ${copyStatus === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'
                    } border-l-4 p-3 fixed top-4 left-4 flex flex-col gap-1 w-[300px] z-50 shadow-lg`}
                role="alert"
            >
                <p className="font-bold text-sm">{alertMessage.title}</p>
                <p className='text-xs'>{alertMessage.message}</p>
            </div>

            <div className="mb-20"></div>
        </main>
    );
}

export default Home;