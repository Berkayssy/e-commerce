import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router";

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
            await api.post("http://localhost:4000/api/auth/register", form);
            alert("User registered successfully", "You can now log in.");
            setForm({ username: "", email: "", password: "" });
            navigate("/login");
        } catch (err) {
            console.error(err.response?.data || err.message);
            setError(err.response?.data?.error || "Registration failed. Try again.");
        }
    };
    return (
       <div className="login">
            <form className="login-container" onSubmit={handleSubmit}>
                <input required className="login-input" name="username" placeholder="Username" onChange={handleChange} />
                <input requiredclassName="login-input" name="email" placeholder="Email" onChange={handleChange} />
                <div className="password-input-wrapper">
                    <input required type={showPassword ? "text" : "password"} className="login-input" name="password" placeholder="Password" onChange={handleChange} />
                    <button type="button" className="toggle-password-btn" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? "🙈" : "👁️"}</button>
                </div>
                <button className="login-btn" type="submit">Register</button>
                <br />
                <p>Already have an account? <a style={{color: "white"}} href="/login">Login</a></p>
                {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            </form>
       </div>
    );
};

export default Register;