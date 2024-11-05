import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Sidebar from './components/sidebars/Sidebar';
import MintNft from './pages/admin/MintNft';
import ListNft from './pages/admin/ListNft';
import AdminSidebar from './components/sidebars/AdminSidebar';
import NotClaimed from './pages/admin/NotClaimed';
import { ClaimPage } from './pages/ClaimPage';
import AddAdmin from './pages/admin/AddAdmin';

const router = createBrowserRouter([
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
                    <div>
                        <AdminSidebar />
                        <ListNft />
                    </div>
                ),
            },
            {
                path: "notclaimed",
                element: (
                    <div>
                        <AdminSidebar />
                        <NotClaimed />
                    </div>
                ),
            },
            {
                path: "mintnft",
                element: <MintNft />
            },
            {
                path: "addadmin",
                element: <AddAdmin />
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
