import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";
import CryptoJS from "crypto-js";

const CheckPasswordPage = () => {
    const [data, setData] = useState({
        password: "",
        userId: ""
    });
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        if(!location?.state?.name){
            navigate("/email");
        }
    },[]);

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
    
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
    
        try {
            const response = await axios({
                method :'POST',
                url : URL,
                data : {
                  userId : location?.state?._id,
                  password : data.password
                },
                withCredentials : true
            });

            toast.success(response.data.message); // This will now wait for the response
    
            if(response.data.success){
                dispatch(setToken(response?.data?.token))
                localStorage.setItem('token',response?.data?.token)
                
                // Decrypt private key using password
                const bytes = CryptoJS.AES.decrypt(response?.data?.encryptedPrivateKey, data.password);
                const privateKey = bytes.toString(CryptoJS.enc.Utf8);

                const userId = location?.state?._id;
                localStorage.setItem("privateKey", privateKey);
    
                setData({
                  password : "",
                })
                navigate('/')
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred"); // Handle errors
        }    
    };

    return (
        <div className='mt-5'>
            <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto">
                <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
                    {/* <PiUserCircle
                    size={80}
                    /> */}
                    <Avatar
                        name={location?.state?.name}
                        width={80}
                        height={80}
                        imageUrl={location?.state?.profile_pic}
                    />
                    <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
                </div>
            
                <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
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

                    <button className="bg-secondary txt-lg px-4 py-1 hover:bg-primary rounded mt-2 font-bold text-white leading-relaxed tracking-wide">
                        Login
                    </button>
                </form>

                <p className="my-3 text-center"><Link to={"/forgot-password"} className="hover:text-primary hover:underline font-semibold">Forgot password ?</Link></p>
            </div>
        </div>
    );
}

export default CheckPasswordPage;