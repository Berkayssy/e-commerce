import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const [ form, setForm ] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const { login } = useAuth();

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
        
        if (!form.email || !form.password) {setError("Please fill in all fields.");return;}
        try {
            await login(form); // Context login
            alert("User logged in successfully");
            navigate("/products");
        } catch (err) {
            console.error(err.response?.data || err.message);
            setError(err.response?.data || { error: "Login failed" });
        }
    };
    return (
        <div className="login"> 
            <form className="login-container" onSubmit={handleSubmit}>
                <input className="login-input" name="email" placeholder="Email" onChange={handleChange} />
                <div className="password-input-wrapper">
                    <input type={showPassword ? "text" : "password"} className="login-input" name="password" placeholder="Password" onChange={handleChange} />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="toggle-password-btn">{showPassword ? "🙈" : "👁️"}</button>
                </div>
                <button className="login-btn" type="submit">Login</button>
                <p>Already have an account? <a style={{color: "white"}} href="/register">Register</a></p>
                {error && <p style={{ color: "red", fontSize: "14px" }}>{typeof error === "string" ? error : error.error}</p>}
            </form>
        </div>
    );
};

export default Login;