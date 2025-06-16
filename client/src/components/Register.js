import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
    
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
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
            <div className="register-container">
                <h1 className="welcome-back-title">Create an Account</h1>
                <p className="welcome-back-subtitle">Sign up to start your journey</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="icon">👤</span>
                        <input required className="register-input" name="username" placeholder="Username" onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <span className="icon">✉️</span>
                        <input required className="register-input" name="email" placeholder="Email" onChange={handleChange} />
                    </div>
                    <div className="input-group password-input-wrapper">
                        <span className="icon">🔒</span>
                        <input required type={showPassword ? "text" : "password"} className="register-input" name="password" placeholder="Password" onChange={handleChange} />
                        <button type="button" className="toggle-password-btn" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? "🙈" : "👁️"}</button>
                    </div>
                    <button className="register-signup-btn" type="submit">Register</button>
                </form>
                
                <div className="or-continue-with">
                    <span>or continue with</span>
                </div>

                <div className="social-login-buttons">
                    <button className="social-btn google">
                        <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
                        <span>Google</span>
                    </button>
                    <button className="social-btn github">
                        <img src="https://img.icons8.com/ios-filled/50/000000/github.png" alt="GitHub" />
                        <span>GitHub</span>
                    </button>
                </div>

                <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
                {error && <p className="error-message">{error}</p>}
            </div>
       </div>
    );
};

export default Register;