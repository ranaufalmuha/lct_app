import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { AuthProvider } from './components/AuthContext'; // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
