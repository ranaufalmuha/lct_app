import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './../AuthContext';

function Sidebar() {
    const { authenticatedActor } = useAuth();
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsAdmin(await authenticatedActor.checkIsController());

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();

    }, [authenticatedActor]);

    return (
        <div>
            {isAdmin == null ? (
                <div className="absolute w-[100%] h-dvh left-0 top-0 justify-center items-center flex p-14">
                    <img src="./images/logo-full-black.png" className="animate-pulse w-24" alt="" />
                </div>
            ) : (
                <div>
                    {isAdmin ? (
                        <div>
                            <div className="absolute pointer-events-none w-[100vw] h-[100vh] flex flex-col justify-center gap-4 px-7 z-10">
                                <a href='/admin/mintnft' className="w-14 aspect-square bg-white backdrop-blur- flex justify-center items-center pointer-events-auto rounded-lg shadow-lg shadow-black/20 p-4 hover:scale-105 duration-300">
                                    <img src="./assets/add.png" className='aspect-square' alt="" />
                                </a>
                                <a href='/admin' className="w-14 aspect-square bg-white flex justify-center items-center pointer-events-auto rounded-lg shadow-lg shadow-black/20 p-4 hover:scale-105 duration-300">
                                    <img src="./assets/list.png" className='aspect-square' alt="" />
                                </a>
                                <a href='/addadmin' className="w-14 aspect-square bg-white flex justify-center items-center pointer-events-auto rounded-lg shadow-lg shadow-black/20 p-4 hover:scale-105 duration-300">
                                    <img src="./assets/admin.png" className='aspect-square' alt="" />
                                </a>
                            </div>
                            <div className="w-full flex flex-col items-center py-5 gap-5">
                                <a href='/' className="flex justify-center items-center">
                                    <img src="./images/logo-full-black.png" className='w-7' alt="" />
                                    <p className='text-center'>Lost Club Toys</p>
                                </a>
                                <Outlet />
                            </div>
                        </div>
                    ) : (
                        <div className="absolute w-[100%] h-dvh left-0 top-0 justify-center items-center flex p-14">
                            <p className='text-xl'>You are not admin</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Sidebar;
