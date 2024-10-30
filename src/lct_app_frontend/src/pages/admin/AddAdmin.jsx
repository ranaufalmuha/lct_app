import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { Principal } from '@dfinity/principal';

export const AddAdmin = () => {
    const { authenticatedActor } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [newAdminId, setNewAdminId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const controllers = await authenticatedActor.listControllers();
            setAdmins(controllers);
        } catch (err) {
            setError('Failed to fetch admins');
            console.error(err);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const principalId = Principal.fromText(newAdminId);
            await authenticatedActor.addController(principalId);
            setSuccess('Admin added successfully');
            setNewAdminId('');
            fetchAdmins();
        } catch (err) {
            setError(err.message || 'Failed to add admin');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAdmin = async (principalId) => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await authenticatedActor.removeController(principalId);
            setSuccess('Admin removed successfully');
            fetchAdmins();
        } catch (err) {
            setError(err.message || 'Failed to remove admin');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Admin Management</h1>
                <p className="text-gray-600 text-sm mt-1">Add or remove admin controllers</p>
            </div>

            {/* Add Admin Form */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="principalId" className="text-sm font-medium text-gray-700">
                            New Admin Principal ID
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                id="principalId"
                                type="text"
                                value={newAdminId}
                                onChange={(e) => setNewAdminId(e.target.value)}
                                placeholder="Enter Principal ID"
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !newAdminId}
                                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                            >
                                {isLoading ? 'Adding...' : 'Add Admin'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
                    {success}
                </div>
            )}

            {/* Admins List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {/* Desktop View */}
                    <table className="min-w-full hidden sm:table">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Principal ID
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin.toString()} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-mono break-all">
                                        {admin.toString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleRemoveAdmin(admin)}
                                            disabled={isLoading || admins.length <= 1}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile View */}
                    <div className="sm:hidden">
                        {admins.map((admin) => (
                            <div
                                key={admin.toString()}
                                className="border-b border-gray-200 p-4 hover:bg-gray-50"
                            >
                                <div className="font-mono text-sm break-all mb-2">
                                    {admin.toString()}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleRemoveAdmin(admin)}
                                        disabled={isLoading || admins.length <= 1}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {admins.length === 0 && (
                        <div className="px-6 py-4 text-center text-gray-500 text-sm">
                            No admins found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAdmin;