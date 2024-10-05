import React, { useEffect, useState } from 'react';
import { lct_app_backend } from 'declarations/lct_app_backend';

const ListNft = () => {

    const [totalSupply, setTotalSuppy] = useState(0);


    async function theList() {
        console.log("test");
        const response = await lct_app_backend.icrc7_total_supply();
        console.log(response);
        setTotalSuppy(Number(response));
    }

    useEffect(() => {
        theList();
    });

    function theNFTs() {
        return (
            <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                <img src="./images/logo-full-black.png" className=' w-full' alt="" />
            </div>
        );
    }



    return (
        <div className='container' >
            <h1>NFTs List is {totalSupply}</h1>
            <section className=' flex justify-center mt-5'>
                <div className="container max-sm:p-4 grid grid-cols-4 max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full">
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>
                    <div className='bg-white shadow-lg shadow-black/20 aspect-square rounded-lg text-white'>
                        <img src="./images/logo-full-black.png" className=' w-full' alt="" />
                    </div>

                </div>
            </section>
        </div>
    );
};

export default ListNft;
