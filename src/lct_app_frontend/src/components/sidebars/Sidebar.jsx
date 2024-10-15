import React from 'react';
import { Outlet } from 'react-router-dom';

function Sidebar() {
    return (
        <div>
            <div className="absolute pointer-events-none w-[100vw] h-[100vh] flex flex-col justify-center gap-4 px-7 z-10">
                <a href='/admin/mintnft' className="w-14 aspect-square bg-white backdrop-blur- flex justify-center items-center pointer-events-auto rounded-lg shadow-lg shadow-black/20 p-4 hover:scale-105 duration-300">
                    <img src="./assets/add.png" className='aspect-square' alt="" />
                </a>
                <a href='/admin' className="w-14 aspect-square bg-white flex justify-center items-center pointer-events-auto rounded-lg shadow-lg shadow-black/20 p-4 hover:scale-105 duration-300">
                    <img src="./assets/list.png" className='aspect-square' alt="" />
                </a>
            </div>
            <div className="w-full flex flex-col items-center py-5 gap-5">
                <div className="flex justify-center items-center">
                    <img src="./images/logo-full-black.png" className='w-7' alt="" />
                    <p className='text-center'>Lost Club Toys</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}

export default Sidebar;
