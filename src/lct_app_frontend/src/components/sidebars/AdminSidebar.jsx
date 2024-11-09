import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { Principal } from '@dfinity/principal';

const AdminSidebar = () => {
    const [name, setName] = useState("Loading...");
    const [logo, setLogo] = useState("./images/FinalLogo.png");
    const [description, setDescription] = useState("Loading...");
    const [totalSupply, setTotalSuppy] = useState(0);
    const [symbol, setSymbol] = useState("Loading...");
    const [notClaimed, setNotClaimed] = useState(0);
    const [claimed, setClaimed] = useState(0);

    const islocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "";
    const backend_canister_principal = islocalhost ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : process.env.CANISTER_ID_LCT_APP_BACKEND;

    async function FetchData() {
        try {
            const response = await lct_app_backend.icrc7_collection_metadata();

            // Menemukan metadata yang dibutuhkan dari respons
            response.forEach((item) => {
                const key = item[0]; // Nama field
                const value = item[1]; // Nilai dari field

                if (key === "icrc7:total_supply" && value.Nat !== undefined) {
                    setTotalSuppy(Number(value.Nat));
                } else if (key === "icrc7:symbol" && value.Text !== undefined) {
                    setSymbol(value.Text);
                } else if (key === "icrc7:name" && value.Text !== undefined) {
                    setName(value.Text);
                } else if (key === "icrc7:logo" && value.Text !== undefined) {
                    // setLogo(value.Text);
                } else if (key === "icrc7:description" && value.Text !== undefined) {
                    setDescription(value.Text);
                }
            });


            const start = [];
            const length = [];
            const owner = {
                owner: Principal.fromText(backend_canister_principal),
                subaccount: []
            };

            const tokens = await lct_app_backend.icrc7_tokens_of(owner, start, length);

            setNotClaimed(tokens.length);
            setClaimed(totalSupply - notClaimed);
        } catch (error) {
            console.error("Error fetching NFTs: ", error);
        }
    }

    useEffect(() => {
        FetchData();
    });

    return (
        <div className='container ' >
            {/* header */}
            <section className='flex justify-center mt-5 mx-6'>
                <div className="container max-sm:p-4 gap-4 w-full flex flex-col">
                    <div className="flex flex-col gap-4 items-start">
                        <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg overflow-hidden text-white w-32 flex p-2'>
                            <img src={logo} className='w-full' alt="" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className='text-xl max-sm:text-lg'>{name}</p>
                            <p className='text-disabled max-sm:text-xs text-sm max-sm:w-full max-sm:line-clamp-3'>{description}</p>
                        </div>
                    </div>
                    <hr />
                    <div className="flex items-start gap-10 justify-start ">
                        {/* total supply */}
                        <div >
                            <p className='text-start text-lg'>{totalSupply}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Total Supply</p>
                        </div>
                        {/* Symbol */}
                        <div >
                            <p className='text-start text-lg'>{symbol}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Symbol</p>
                        </div>
                        {/* Not Claimed */}
                        <div>
                            <p className='text-start text-lg'>{notClaimed}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Not Claimed</p>
                        </div>
                        {/* Claimed */}
                        <div>
                            <p className='text-start text-lg'>{claimed}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Claimed</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className='mt-8 mx-6 flex gap-10 justify-center'>
                <a href="/admin" className='w-1/2 py-3 px-5 gap-2 flex justify-center items-center border-b hover:scale-105 duration-300 hover:shadow-md'>
                    <img src="./assets/nft.png" className='w-5 h-5' alt="" />
                    <p className='text-disabled text-sm'>All NFT</p>
                </a>
                <a href="/admin/notclaimed" className='w-1/2 py-3 px-5 gap-2 flex justify-center items-center border-b hover:scale-105 duration-300 hover:shadow-md'>
                    <img src="./assets/qr.png" className='w-5 h-5' alt="" />
                    <p className='text-disabled text-sm'>Not Claimed</p>
                </a>
            </section>

            {/* NFTs List  */}
            <Outlet />

        </div >
    );
};

export default AdminSidebar;
