"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../../../utils/useAuth";

const UpdateItem = ({ params }) => {
    const { id } = params;
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        image: "",
        email: ""
    });
    const [ownerEmail, setOwnerEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const router = useRouter();
    const loginUserEmail = useAuth();

    useEffect(() => {
        const getSingleImage = async (id) => {
            try {
                const response = await fetch(`http://localhost:3000/api/item/readsingle/${id}`, { cache: "no-store" });
                const jsonData = await response.json();
                const singleItem = jsonData.singleItem;
                setOwnerEmail(singleItem.email);
                setFormData({
                    title: singleItem.title,
                    price: singleItem.price,
                    description: singleItem.description,
                    image: singleItem.image,
                    email: singleItem.email
                });
            } catch (error) {
                console.error("Error fetching item:", error);
            } finally {
                setIsLoading(false);
            }
        };
        getSingleImage(id);
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = {
                ...formData,
                email: loginUserEmail
            };
            const response = await fetch(`http://localhost:3000/api/item/update/${id}`, {
                method: "PUT",
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(requestBody)
            });
            if (response.ok) {
                console.log("Item Updated successfully");
                // Reset form or redirect to another page
                setFormData({
                    title: "",
                    price: "",
                    description: "",
                    image: "",
                    email: ""
                });
                const jsonData = await response.json();
                alert(jsonData.message);
                router.push("/"); // Redirect to the home page
                router.refresh(); // Refresh the page to show the new item

            } else {
                console.error("Error updating item");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (isLoading || !loginUserEmail) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (loginUserEmail === ownerEmail) {

        return (
            <div>
                <h1>Update Item Page</h1>
                {/* Form for updating an item will go here */}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title" name="title" value={formData.title} onChange={handleChange} required />
                    <input type="number" placeholder="Price" name="price" value={formData.price} onChange={handleChange} required />
                    <textarea placeholder="Description" name="description" rows={14} value={formData.description} onChange={handleChange} required></textarea>
                    <input type="text" placeholder="Image URL" name="image" value={formData.image} onChange={handleChange} required />
                    <button type="submit">Update Item</button>
                </form>
            </div>
        );
    } else {
    return (
        <div>
            <h1>You are not authorized to update this item.</h1>
        </div>
    );
}

};

export default UpdateItem;