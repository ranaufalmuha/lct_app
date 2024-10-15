import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import App from './App';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Sidebar from './components/sidebars/Sidebar';
import MintNft from './pages/admin/MintNft';
import ListNft from './pages/admin/ListNft';
import AdminSidebar from './components/sidebars/AdminSidebar';
import NotClaimed from './pages/admin/NotClaimed';
import { ClaimPage } from './pages/ClaimPage';

const router = createBrowserRouter([
    // dummy 
    {
        path: "/app",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        ),
    },
    // real 
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute>
                <Sidebar />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <div className="">
                        <AdminSidebar />
                        <ListNft />,
                    </div>
                ),
            },
            {
                path: "notclaimed",
                element: (
                    <div className="">
                        <AdminSidebar />
                        <NotClaimed />,
                    </div>
                ),
            },
            {
                path: "mintnft",
                element: <MintNft />,
            },
        ]
    },
    {
        path: "/claim/:nftid",
        element: (
            <ProtectedRoute>
                <ClaimPage />
            </ProtectedRoute>
        ),
    },
]);

export default router;
