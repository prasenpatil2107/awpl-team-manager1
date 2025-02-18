import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import UserList from './pages/UserList';
import UserDetails from './pages/UserDetails';
import ProductList from './pages/ProductList';
import NewSale from './pages/NewSale';
import PaymentEntry from './pages/PaymentEntry';
import UnassignedUsers from './pages/UnassignedUsers';

const App: React.FC = () => {
    return (
        <>
            <CssBaseline />
            <Layout>
                <Routes>
                    <Route path="/" element={<UserList />} />
                    <Route path="/users/:id" element={<UserDetails />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/sales/new" element={<NewSale />} />
                    <Route path="/payments" element={<PaymentEntry />} />
                    <Route path="/users/unassigned" element={<UnassignedUsers />} />
                </Routes>
            </Layout>
        </>
    );
};

export default App; 