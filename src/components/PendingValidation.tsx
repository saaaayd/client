import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

export function PendingValidation() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-center">
                    <div className="rounded-full bg-yellow-100 p-4">
                        <Clock className="h-12 w-12 text-yellow-600" />
                    </div>
                </div>

                <div>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#001F3F] tracking-tight">
                        Account Pending
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Please wait for a while your account is being validated by the admin.
                    </p>
                </div>

                <div className="pt-6">
                    <button
                        onClick={logout}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#001F3F] bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001F3F] transition-colors"
                    >
                        Back to Home Page
                    </button>
                </div>
            </div>
        </div>
    );
}
