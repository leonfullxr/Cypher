import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { uploadPhoto } from "../utils/uploadFile";
import Divider from "./Divider";

const EditUserDetails = ({onClose, user}) => {
    const [data, setData] = useState({
        name: user?.user,
        profile_pic: user?.profile_pic
    });

    useEffect(() => {
        setData((preve) => {
            return {
                ...preve,
                ...user
            }
        })
    },[user]);

    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        });
    }

    const handleUploadPhoto = async(e) => {
        const file = e.target.files[0];
        const uploadPhoto = await uploadPhoto(file);
        setData((preve) => {
            return {
                ...preve,
                profile_pic: uploadPhoto?.url
            }
        });
    }

    const handleOnSubmit = async(e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleSubmit = async() => {
        console.log("submitting");
    }
            
    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm">
                <h2 className="font-semibold"> Profile details</h2>
                <p className="text-sm">Edit user details</p>
            
                <form className="grid-gap-3 mt-3" onSubmit={handleOnSubmit}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name" >Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={handleOnChange}
                            className="w-full py-1 px-2 focus:outline-primary border-0.5"
                        ></input>
                    </div>

                    <div>
                        <div>Photo:</div>
                        <div className='my-1 flex items-center gap-4'>
                            <Avatar
                                width={40}
                                height={40}
                                imageUrl={data?.profile_pic}
                                name={data?.name}
                            />
                            <label htmlFor='profile_pic'>
                            <button className='font-semibold'>Change Photo</button>
                            <input
                                type='file'
                                id='profile_pic'
                                className='hidden'
                                onChange={handleUploadPhoto}
                            />
                            </label>
                        </div>
                    </div>
    
                    <Divider/>
                    <div className='flex gap-2 w-fit ml-auto '>
                        <button onClick={onClose} className='border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white'>Cancel</button>
                        <button onSubmit={handleSubmit} className='border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary'>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default React.memo(EditUserDetails);