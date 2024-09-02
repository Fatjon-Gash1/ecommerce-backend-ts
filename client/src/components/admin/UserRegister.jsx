import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../features/user/userSlice';

function UserRegister() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && email && password) {
            dispatch(registerUser({ username, email, password }));
            // Clear form fields after submission
            setUsername('');
            setEmail('');
            setPassword('');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-slate-100 p-6 shadow-xl rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
                Register as an administrator
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2 text-left"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2 text-left"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2 text-left"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Register
                </button>
            </form>
        </div>
    );
}

export default UserRegister;
