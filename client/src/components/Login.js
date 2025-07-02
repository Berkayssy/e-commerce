import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { googleLogin } from "../api/api";
import './Login.css';
import InputGroup from './common/InputGroup';
import PasswordInput from './common/PasswordInput';
import ErrorMessage from './common/ErrorMessage';
import SocialLoginButtons from './common/SocialLoginButtons';

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            await login(form);
            navigate("/products");
        } catch (err) {
            console.error(err.response?.data || err.message);
            setError(err.response?.data || { error: "Login failed" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginWithAccessToken = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const redirectUri = `${window.location.origin}/google-callback.html`;
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email profile&prompt=select_account`;
            
            const popup = window.open(googleAuthUrl, 'googleAuth', 'width=500,height=600,scrollbars=yes,resizable=yes');
            
            if (!popup) {
                setError("Popup blocked. Please allow popups for this site.");
                setIsLoading(false);
                return;
            }
            
            const messageHandler = async (event) => {
                if (event.origin !== window.location.origin) return;
                
                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    const { access_token } = event.data;
                    
                    try {
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: {
                                'Authorization': `Bearer ${access_token}`
                            }
                        });
                        
                        if (!userInfoResponse.ok) {
                            throw new Error('Failed to get user info from Google');
                        }
                        
                        const userInfo = await userInfoResponse.json();
                        
                        const response = await googleLogin({
                            access_token,
                            userInfo
                        });
                        
                        await login({
                            token: response.token,
                            user: response.user
                        });
                        
                        popup.close();
                        window.removeEventListener('message', messageHandler);
                        navigate("/products");
                    } catch (err) {
                        console.error('Backend login error:', err);
                        setError("Login failed. Please try again.");
                        popup.close();
                    }
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    setError("Google authentication failed: " + (event.data.error || 'Unknown error'));
                    popup.close();
                }
                
                window.removeEventListener('message', messageHandler);
                setIsLoading(false);
            };
            
            window.addEventListener('message', messageHandler);
            
        } catch (err) {
            console.error('Google login error:', err);
            setError("Google authentication failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-image-container">
                <img src="/login-hero.jpg" alt="Luxury Car" className="login-hero-image" />
                <div className="login-image-overlay"></div>
            </div>
            <div className="login-header">
                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
            <div className="login-container">
                <h1 className="welcome-back-title">Welcome Back</h1>
                <p className="welcome-back-subtitle">Sign in to continue your journey</p>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        icon="✉️"
                        name="email"
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                    <PasswordInput
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
                    <button 
                        className="login-signin-btn" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
                <div className="or-continue-with">
                    <span>or continue with</span>
                </div>
                <SocialLoginButtons 
                    onGoogle={handleGoogleLoginWithAccessToken}
                    onWeb3={() => {}}
                    loading={isLoading}
                />
                <p className="signup-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
                <ErrorMessage error={error} />
            </div>
        </div>
    );
};

export default Login;