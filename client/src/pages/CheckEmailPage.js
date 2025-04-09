import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { PiUserCircle } from "react-icons/pi";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useDispatch } from "react-redux";

const CheckEmailPage = () => {
    const [data, setData] = useState({
        email: ""
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setData((previous)=>{
            return {
                ...previous,
                [name]: value
            }
        })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`;
    
        try {
            const response = await axios.post(URL, data); // Await the response
    
            toast.success(response.data.message); // This will now wait for the response
    
            if (response.data.success) { // Check success status
                setData({
                    email: ""
                });
    
                navigate("/password",{
                    state: response?.data?.data
                });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred"); // Handle errors
        }    
    };

    return (
        <div className='mt-5'>
            <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto">
                <div className='w-fit mx-auto mb-2'>
                    <PiUserCircle
                    size={80}
                    />
                </div>
                
                <h3> Welcome to Cypher!</h3>
            
                <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
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

                    <button className="bg-secondary txt-lg px-4 py-1 hover:bg-primary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
                        Login
                    </button>
                </form>

                <div className="my-3 flex justify-center">
                    <GoogleLoginButton dispatch={dispatch} />
                </div>

                <p className="my-3 text-center">New user ? <Link to={"/register"} className="hover:text-primary hover:underline font-semibold">Register</Link></p>
            </div>
        </div>
    );
}

export default CheckEmailPage;