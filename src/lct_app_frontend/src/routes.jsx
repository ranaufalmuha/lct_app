import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import App from './App';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Sidebar from './components/Sidebar';
import MintNft from './pages/admin/MintNft';
import ListNft from './pages/admin/ListNft';

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
        element: <Sidebar />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <ListNft />
                    </ProtectedRoute>
                ),
            },
            {
                path: "mintnft",
                element: <MintNft />,
            },
        ]
    },
]);

export default router;
