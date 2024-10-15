import React, { useEffect, useState } from 'react';
import { lct_app_backend } from 'declarations/lct_app_backend';
import { NFTComponentNotClaimed } from '../../components/NFTs/NFTComponentNotClaimed';

const NotClaimed = () => {
    const [totalSupply, setTotalSuppy] = useState(3);

    useEffect(() => {
    });

    return (
        <div className='container' >

            {/* NFTs List  */}
            <section className=' flex justify-center mt-7'>
                {totalSupply <= 0 ?
                    (
                        < div className="flex justify-center w-full  text-disabled"><p>no nft minted</p>
                        </div>
                    ) : (
                        < div className="container max-sm:p-4 grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 gap-4 w-full justify-items-center duration-300">
                            {/* Show Component */}
                            {Array.from({ length: totalSupply }).map((_, index) => (
                                <NFTComponentNotClaimed key={index} />
                            ))}
                        </div>
                    )
                }
            </section >
        </div >
    );
};

export default NotClaimed;
