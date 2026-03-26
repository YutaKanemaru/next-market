"use client";
import { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:3000/api/user/login", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            });
            const jsonData = await response.json();
            if (response.ok) {
                alert(jsonData.message);
                localStorage.setItem("token", jsonData.token);
            } else {
                alert(jsonData.message);
            }
        } catch (error) {
            alert("Error logging in user:");
        }
    };

    return (
        <div>
            <h1>User Login Page</h1>
            <form onSubmit={handleSubmit}>
                <input value={email}
                onChange={(e) => { 
                    setEmail(e.target.value)
                    }} type="email" placeholder="Email" name="email" required />
                <input value={password}
                onChange={(e) => { 
                    setPassword(e.target.value)
                    }} type="password" placeholder="Password" name="password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;