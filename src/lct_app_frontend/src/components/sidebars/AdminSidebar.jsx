import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { NFTComponent } from '../NFTs/NFTComponent';

const AdminSidebar = () => {

    const [name, setName] = useState("theName");
    const [logo, setLogo] = useState("./images/FinalLogo.jpeg");
    const [description, setDescription] = useState("lorem ipsum dolor sit amet, consectetur adipiscing");
    const [totalSupply, setTotalSuppy] = useState(3);
    const [symbol, setSymbol] = useState("theSymbol");
    const [notClaimed, setNotClaimed] = useState(0);
    const [claimed, setClaimed] = useState(0);


    async function FetchData() {
        console.log("Fetching metadata...");
        const response = await lct_app_backend.icrc7_collection_metadata();
        console.log("Response:", response);

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
                setLogo(value.Text);
            } else if (key === "icrc7:description" && value.Text !== undefined) {
                setDescription(value.Text);
            }
        });
    }

    useEffect(() => {
        FetchData();
    });

    return (
        <div className='container' >
            {/* header */}
            <section className='flex justify-center mt-5'>
                <div className="container max-sm:p-4 gap-4 w-full flex flex-col">
                    <div className="flex gap-4 items-center">
                        <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg overflow-hidden text-white w-32 flex'>
                            <img src={logo} className=' w-full' alt="" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className='text-xl'>{name}</p>
                            <p className='text-disabled text-sm w-3/4'>{description}</p>
                        </div>
                    </div>
                    <hr />
                    <div className="flex items-center gap-10 justify-start">
                        {/* tottal supply */}
                        <div>
                            <p className='text-start text-lg'>{totalSupply}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Total Supply</p>
                        </div>
                        {/* Symbol */}
                        <div>
                            <p className='text-start text-lg'>{symbol}</p>
                            <p className='text-start text-sm text-disabled lowercase'>Symbol</p>
                        </div>
                        {/* Not Claimed */}
                        <div>
                            <p className='text-start text-lg'>10</p>
                            <p className='text-start text-sm text-disabled lowercase'>Not Claimed</p>
                        </div>
                        {/* Claimed */}
                        <div>
                            <p className='text-start text-lg'>3</p>
                            <p className='text-start text-sm text-disabled lowercase'>Claimed</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className='mt-8 flex gap-10 justify-center'>
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
