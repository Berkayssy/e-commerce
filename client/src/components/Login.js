import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import './Login.css';

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Add entrance animation class to elements
        const elements = document.querySelectorAll('.login-container > *');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'all 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
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

    return (
        <div className="login-page">
            <div className="login-image-container">
                <img src="/login-hero.jpg" alt="Luxury Car" className="login-hero-image" />
                <div className="login-image-overlay"></div>
            </div>
            <div className="login-container">
                <h1 className="welcome-back-title">Welcome Back</h1>
                <p className="welcome-back-subtitle">Sign in to continue your journey</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="icon">✉️</span>
                        <input 
                            className="login-input" 
                            name="email" 
                            placeholder="Email" 
                            onChange={handleChange}
                            type="email"
                            autoComplete="email"
                        />
                    </div>
                    <div className="input-group password-input-wrapper">
                        <span className="icon">🔒</span>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="login-input" 
                            name="password" 
                            placeholder="Password" 
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword((prev) => !prev)} 
                            className="toggle-password-btn"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <button 
                        className="login-signin-btn" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">⏳</span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
                
                <div className="or-continue-with">
                    <span>or continue with</span>
                </div>

                <div className="social-login-buttons">
                    <button className="social-btn google" aria-label="Sign in with Google">
                        <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                        <span>Google</span>
                    </button>
                    <button className="social-btn github" aria-label="Sign in with GitHub">
                        <img src="https://img.icons8.com/ios-filled/50/000000/github.png" alt="GitHub" />
                        <span>GitHub</span>
                    </button>
                </div>

                <p className="signup-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
                {error && (
                    <div className="error-message" role="alert">
                        {typeof error === "string" ? error : error.error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;