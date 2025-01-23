import React, { useState } from "react";
import {IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import toast from "react-hot-toast";
import { generateSignalKeys } from "../lib/signalHelper";

const RegisterPage = () => {
    const [data, setData] = useState({
      name: "",
      email: "",
      password: "",
      profile_pic: "",
    });
    const [uploadPhoto, setUploadPhoto] = useState("");
    const navigate = useNavigate();
  
    const handleOnChange = (e) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleUploadPhoto = async (e) => {
      const file = e.target.files[0];
      const uploaded = await uploadFile(file);
      setUploadPhoto(file);
  
      setData((prev) => ({
        ...prev,
        profile_pic: uploaded?.url,
      }));
    };
  
    const handleClearUploadPhoto = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setUploadPhoto(null);
      setData((prev) => ({
        ...prev,
        profile_pic: "",
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
  
      try {
        const signalKeys = await generateSignalKeys();
        
        const payload = {
            ...data,
            signal: {
                identityPublicKey: signalKeys.identityPublicKey,
                registrationId: signalKeys.registrationId,
                signedPreKey: signalKeys.signedPreKey,
                preKeys: signalKeys.preKeys
            }
        };
  
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;
        const response = await axios.post(URL, payload); 
        toast.success(response.data.message);
  
        if (response.data.success) {
          // Reset form
          setData({ name: "", email: "", password: "", profile_pic: "" });
          setUploadPhoto(null);
          navigate("/email");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "An error occurred");
      }
    };
  
    return (
      <div className="mt-5">
        <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto">
          <h3>Welcome to Cypher!</h3>
          <form className="grid gap-3 mt-4" onSubmit={handleSubmit}>
            {/* NAME */}
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
  
            {/* EMAIL */}
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
  
            {/* PASSWORD */}
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
  
            {/* PROFILE PIC */}
            <div className="flex flex-col gap-1">
              <label htmlFor="profile_pic">
                Photo:
                <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer">
                  <p className="text-sm max-w-[300] text-ellipsis line-clamp-1">
                    {uploadPhoto?.name ? uploadPhoto?.name : "Upload profile photo"}
                  </p>
                  {uploadPhoto?.name && (
                    <button className="text-lg ml-2 hover:text-red-600" onClick={handleClearUploadPhoto}>
                      <IoClose />
                    </button>
                  )}
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
  
            <button
              className="bg-secondary txt-lg px-4 py-1 hover:bg-primary rounded mt-2 font-bold text-white leading-relaxed tracking-wide"
            >
              Register
            </button>
          </form>
  
          <p className="my-3 text-center">
            Already have an account ?{" "}
            <Link to={"/email"} className="hover:text-primary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    );
  };
  
  export default RegisterPage;