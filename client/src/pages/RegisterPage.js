import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import toast from "react-hot-toast";

const RegisterPage = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        profile_pic: ""
    });
    const [uploadPhoto, setUploadPhoto] = useState("");
    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((previous) => {
            return {
                ...previous,
                [name]: value
            };
        });
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];

        const uploadPhoto = await uploadFile(file);

        setUploadPhoto(file);

        setData((previous) => {
            return {
                ...previous,
                profile_pic: uploadPhoto?.url
            };
        });
    };

    const handleClearUploadPhoto = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setUploadPhoto(null);
    };

    const validatePassword = (password) => {
        const lengthRequirement = password.length >= 6;
        const numberRequirement = /\d/.test(password);
        const specialCharacterRequirement = /[!@#$%^&*(),.?+_":{}|<>]/.test(password);
        const capitalLetterRequirement = /[A-Z]/.test(password);

        if (!lengthRequirement) {
            return "Password must be at least 6 characters long.";
        }
        if (!numberRequirement) {
            return "Password must contain at least 1 number.";
        }
        if (!specialCharacterRequirement) {
            return "Password must contain at least 1 special character.";
        }
        if (!capitalLetterRequirement) {
            return "Password must contain at least 1 capital letter.";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const passwordError = validatePassword(data.password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;

        try {
            const response = await axios.post(URL, data);
            console.log("response", response);

            toast.success(response.data.message);

            if (response.data.success) {
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    profile_pic: ""
                });

                navigate("/email");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred");
        }

        console.log("data", data);
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
                        <label htmlFor="confirmPassword">Confirm Password :</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            className="bg-slate-100 px-2 py-1 focus:outline-primary"
                            value={data.confirmPassword}
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
                                            <IoClose />
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
