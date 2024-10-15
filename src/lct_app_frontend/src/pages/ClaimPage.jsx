import React, { useState } from 'react'
import { useParams } from 'react-router-dom';

export const ClaimPage = () => {
    const { nftid } = useParams();
    const [name, setName] = useState("Black Lost")
    const [imgUrl, setImgUrl] = useState("./images/FinalLogo.jpeg")
    return (
        <main className='flex justify-center'>

            <div className="container max-w-[400px] p-3 flex flex-col gap-5">
                <img src={imgUrl} alt="" className='rounded-xl' />
                <div className="flex justify-between  gap-5">
                    <p className='text-xl font-bold'>{name}</p>
                    <p>#{nftid}</p>
                </div>
                <button className=' bg-gradient-to-b from-black via-black to-gray-800 hover:scale-105 duration-300 text-white py-2 px-5 rounded-lg'>Claim NFT</button>
            </div>
        </main>
    )
}
