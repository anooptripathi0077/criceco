import React, { useState } from 'react';
// We no longer need useNavigate here!
import { backendAPI } from '../services/api';

const Login = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let response;
            if (isLoginMode) {
                // Handle Login
                response = await backendAPI.post('/auth/login', { email, password });
            } else {
                // Handle Register (Defaulting to 'User' role for now)
                response = await backendAPI.post('/auth/register', { name, email, password, role: 'User' });
            }

            // 🚨 THE FIX: Force a hard refresh of the browser
            // This guarantees App.jsx sees your cookie and unlocks the Checkout page
            window.location.href = '/';
            
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2>{isLoginMode ? 'Login to SecureSeat' : 'Create an Account'}</h2>
            
            {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLoginMode && (
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                )}
                
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                
                <button type="submit" style={{ padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLoginMode ? 'Login' : 'Register'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#666' }} onClick={() => setIsLoginMode(!isLoginMode)}>
                {isLoginMode ? "Don't have an account? Register here." : "Already have an account? Login here."}
            </p>
        </div>
    );
};

export default Login;