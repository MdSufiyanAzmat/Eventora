import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [adminRegistrationCode, setAdminRegistrationCode] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                await register(name, email, password, role, adminRegistrationCode);
                setShowOTP(true);
                setError('');
            } else {
                const user = await verifyOTP(email, otp);
                navigate(user.role === 'admin' ? '/admin' : '/dashboard');
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
                <p className="text-gray-500">Join Eventora today</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center shadow-inner border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                {!showOTP ? (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <fieldset>
                            <legend className="block text-sm font-semibold text-gray-700 mb-2">Account Type</legend>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`cursor-pointer rounded-lg border p-3 text-center transition ${role === 'user' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={role === 'user'}
                                        onChange={() => setRole('user')}
                                        className="sr-only"
                                    />
                                    <span className="block text-sm font-bold">User</span>
                                </label>
                                <label className={`cursor-pointer rounded-lg border p-3 text-center transition ${role === 'admin' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={() => setRole('admin')}
                                        className="sr-only"
                                    />
                                    <span className="block text-sm font-bold">Admin</span>
                                </label>
                            </div>
                        </fieldset>
                        {role === 'admin' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Registration Code</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm"
                                    value={adminRegistrationCode}
                                    onChange={(e) => setAdminRegistrationCode(e.target.value)}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <p className="text-sm text-green-700 bg-green-50 p-3 mb-4 rounded border border-green-200">
                            An OTP has been sent to your email. Please verify your account.
                        </p>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (OTP)</label>
                        <input
                            type="text"
                            required
                            placeholder="6-digit code"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition shadow-md mt-4"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify & Complete' : 'Sign Up')}
                </button>
            </form>

            {!showOTP && (
                <p className="text-center mt-6 text-gray-600">
                    Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline">Sign in</Link>
                </p>
            )}
        </div>
    );
};

export default Register;
