import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import InputGroup from './common/InputGroup';
import PasswordInput from './common/PasswordInput';
import ErrorMessage from './common/ErrorMessage';
import SocialLoginButtons from './common/SocialLoginButtons';

const Register = () => {
    
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {setError("Invalid email format");return;}
        if (!form.username || !form.email || !form.password) {setError("Please fill in all fields.");return;}
        if (form.password.length < 6) {setError("Password must be at least 6 characters.");return;}
        
        try {
            await api.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);
            setForm({ username: "", email: "", password: "" });
            navigate("/login");
        } catch (err) {
            console.error(err.response?.data || err.message);
            setError(err.response?.data?.error || "Registration failed. Try again.");
        }
    };

    return (
       <div className="register-page">
            <div className="register-image-container">
                <img src="/login-hero.jpg" alt="Luxury Car" className="register-hero-image" />
                <div className="register-image-overlay"></div>
            </div>
            <div className="register-header">
                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
            <div className="register-container">
                <h1 className="welcome-back-title">Create an Account</h1>
                <p className="welcome-back-subtitle">Sign up to start your journey</p>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        icon="👤"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <InputGroup
                        icon="✉️"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <PasswordInput
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button 
                        className="register-signup-btn" 
                        type="submit"
                    >
                        Register
                    </button>
                </form>
                
                <div className="or-continue-with">
                    <span>or continue with</span>
                </div>

                <SocialLoginButtons 
                    onGoogle={() => {}}
                    onWeb3={() => {}}
                    loading={false}
                />

                <p className="login-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
                <ErrorMessage error={error} />
            </div>
       </div>
    );
};

export default Register;