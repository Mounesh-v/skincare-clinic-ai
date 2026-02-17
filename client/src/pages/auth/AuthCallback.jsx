import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');

        if (token) {
            // Store the token
            localStorage.setItem('token', token);

            // Fetch user data
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));

                        // Trigger header to update immediately
                        window.dispatchEvent(new Event('auth:updated'));

                        const providerName = provider === 'google' ? 'Google' : 'Facebook';
                        toast.success(`Welcome back via ${providerName}! 👋`);
                        navigate('/');
                    } else {
                        throw new Error('Failed to fetch user data');
                    }
                })
                .catch(error => {
                    console.error('Auth callback error:', error);
                    toast.error('Authentication failed. Please try again.');
                    navigate('/login');
                });
        } else {
            toast.error('Authentication failed. No token received.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
