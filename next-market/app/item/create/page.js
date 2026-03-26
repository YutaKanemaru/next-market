"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateItem = () => {
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        image: "",
        email: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/api/item/create", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                console.log("Item created successfully");
                // Reset form or redirect to another page
                setFormData({
                    title: "",
                    price: "",
                    description: "",
                    image: "",
                    email: ""
                });
                const jsonData = await response.json();
                alert(jsonData);
                router.push("/"); // Redirect to the home page
                router.refresh(); // Refresh the page to show the new item

            } else {
                console.error("Error creating item");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h1>Create Item Page</h1>
            {/* Form for creating an item will go here */}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" name="title" value={formData.title} onChange={handleChange} required />
                <input type="number" placeholder="Price" name="price" value={formData.price} onChange={handleChange} required />
                <textarea placeholder="Description" name="description" rows={14} value={formData.description} onChange={handleChange} required></textarea>
                <input type="text" placeholder="Image URL" name="image" value={formData.image} onChange={handleChange} required />
                <button type="submit">Create Item</button>
            </form>
        </div>
    );
}

export default CreateItem;