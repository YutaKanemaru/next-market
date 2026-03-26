"use client";
import { useState } from "react";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:3000/api/user/register", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert("User registered successfully!");
            } else {
                alert("Error registering user:");
            }
        } catch (error) {
            alert("Error registering user:");
        }
    };


    return (
        <div>
            <h1>User Registration Page</h1>
            <form onSubmit={handleSubmit}>
                <input value={name}
                onChange={(e) => { 
                    setName(e.target.value)
                    }} type="text" placeholder="Name" name="name" required />
                <input value={email}
                onChange={(e) => { 
                    setEmail(e.target.value)
                    }} type="email" placeholder="Email" name="email" required />
                <input value={password}
                onChange={(e) => { 
                    setPassword(e.target.value)
                    }} type="password" placeholder="Password" name="password" required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;