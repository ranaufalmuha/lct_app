import { useAuth } from './../components/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const { principal, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (

        <main className=''>
            {/* Main content */}
            <section className='h-[45vh] min-h-[400px] bg-gradient-to-b from-black via-black to-gray-800 text-white p-6 flex flex-col'>
                <div className="flex items-center justify-between">
                    <div className="w-32 max-sm:w-4"></div>
                    <div className="flex justify-center items-center">
                        <img src="./images/logo-full-black.png" className='w-7 invert' alt="" />
                        <p className='text-center'>Lost Club Toys</p>
                    </div>
                    <div className="flex items-center">
                        <p className='w-28 relative line-clamp-1 text-sm max-sm:hidden'>{principal}</p>
                        <button onClick={handleLogout}><img src="./assets/logout.png" alt="" className='w-4 aspect-square' /></button>
                    </div>

                </div>

                <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
                    <div className='flex flex-col items-center  gap-1'>
                        <p className='text-8xl'>5</p>
                        <p> NFTs</p>
                    </div>
                </div>
            </section>

            {/* NFTs  */}
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
            <div className="mb-20"></div>
        </main>
    );
}

export default Home;
