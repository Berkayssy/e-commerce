import { useState } from "react";
import axios from "axios";

const AddProduct = () => {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
    });

    const [ successMessage, setSuccessMessage ] = useState("");
    const [ error, setError ] = useState("");

    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${process.env.REACT_APP_API_URL}/products`, product, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setSuccessMessage("Product added successfully!");
            setError("");
            setProduct({
                name: "",
                description: "",
                price: "",
            }); // Reset the form
        } catch (err) {
            console.error(err);
            setError("Error adding product. (Are you admin?)");
            setSuccessMessage("");
        }
    };

    return (
        <div className="order-list">
            <form className="login-container" onSubmit={handleSubmit}>
                <input className="login-input" type="text" name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required/>
                <textarea className="login-input" style={{ width: "300px" }} name="description" placeholder="Description" value={product.description} onChange={handleChange} />
                <input className="login-input" type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} />
                <button className="login-btn" type="submit">Add Product</button>
                {successMessage && <p style={{ color: "white" }}>{successMessage}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
};

export default AddProduct;
