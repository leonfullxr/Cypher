import React, { useState } from "react";
import {IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import toast from "react-hot-toast";

const RegisterPage = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        profile_pic: ""
    });
    const [uploadPhoto, setUploadPhoto] = useState("");
    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setData((previous)=>{
            return {
                ...previous,
                [name]: value
            }
        })
    };
    const handleUploadPhoto = async(e) => {
        const file = e.target.files[0];

        const uploadPhoto = await uploadFile(file);
        
        setUploadPhoto(file);

        setData((previous)=>{
            return {
                ...previous,
                profile_pic: uploadPhoto?.url
            }
        })
    }
    const handleClearUploadPhoto = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setUploadPhoto(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;
    
        try {
            const response = await axios.post(URL, data); // Await the response
            console.log("response", response);
    
            toast.success(response.data.message); // This will now wait for the response
    
            if (response.data.success) { // Check success status
                setData({
                    name: "",
                    email: "",
                    password: "",
                    profile_pic: ""
                });
    
                navigate("/email"); // Redirect after successful registration
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred"); // Handle errors
        }
    
        console.log("data", data); // Log data after handling response
    };
    
            
    return (
        <div className='mt-5'>
            <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto">
                <h3> Welcome to Cypher!</h3>
            
                <form className="grid gap-3 mt-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name">Name :</label>
                            <input 
                                type="text"
                                id="name" 
                                name="name"
                                placeholder="Your name"
                                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                                value={data.name}
                                onChange={handleOnChange}
                                required
                            />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">Email :</label>
                            <input 
                                type="email"
                                id="email" 
                                name="email"
                                placeholder="Your email"
                                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                                value={data.email}
                                onChange={handleOnChange}
                                required
                            />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">Password :</label>
                            <input 
                                type="password"
                                id="password" 
                                name="password"
                                placeholder="Your password"
                                className="bg-slate-100 px-2 py-1 focus:outline-primary"
                                value={data.password}
                                onChange={handleOnChange}
                                required
                            />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="profile_pic">Photo :
                            <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer">
                                <p className="text-sm max-w-[300] text-ellipsis line-clamp-1">
                                    {
                                        uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"
                                    }
                                </p>
                                {
                                    uploadPhoto?.name && (
                                        <button className="text-lg ml-2 hover:text-red-600" onClick={handleClearUploadPhoto}>
                                            <IoClose/>
                                        </button>
                                    )
                                }
                                
                            </div>
                        </label>                            
                            <input 
                                type="file"
                                id="profile_pic" 
                                name="profile_pic"
                                className="bg-slate-100 px-2 py-1 focus:outline-primary hidden"
                                onChange={handleUploadPhoto}
                            />
                    </div>

                    <button className="bg-secondary txt-lg px-4 py-1 hover:bg-primary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
                        Register
                    </button>
                </form>

                <p className="my-3 text-center">Already have an account ? <Link to={"/email"} className="hover:text-primary hover:underline font-semibold">Login</Link></p>
            </div>
        </div>
    );
}

export default RegisterPage;