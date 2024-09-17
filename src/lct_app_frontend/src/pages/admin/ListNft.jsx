import React from 'react';
const ListNft = () => {


    return (
        <div className='container' >
            <h1>NFTs List</h1>
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
