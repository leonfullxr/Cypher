import React, { useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";

const SideBar = () => {
    const user = useSelector((state) => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [openSearchUser, setOpenSearchUser] = useState(false);

    return (
        <div className="w-full h-full grid grid-cols-[48px,1fr]">
            <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between'>
                    <div>
                        <NavLink className={({isActive})=>`w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive && "bg-slate-200"}`} title='chat'>
                        <IoChatbubbleEllipses
                            size={25}
                        />
                        </NavLink>

                        <div title='add friend' onClick={setOpenSearchUser} className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' >
                            <FaUserPlus size={25}/>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <button className="mx-auto" title={user?.name} onClick={()=>setEditUserOpen(true)}>
                            <Avatar
                                width={33}
                                height={33}
                                name={user?.name}
                                imageUrl={user?.profile_pic}
                                userId={user?._id}
                            />
                        </button>
                    <button title='logout' className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'>
                        <span className='-ml-2'>
                            <BiLogOut size={25}/>
                        </span>
                    </button>
                    </div>
            </div>

            <div className="w-full">
                <div className="flex items-center h-16">
                    <h2 className="text-xl font-bold p-2 text-slate-800 h-16">Message</h2>
                </div>
                <div className="bg-slate-200 p-[0.5px]"> </div>
                
                <div className="h-[calc(100vh-60px)] overflow-x-hidden overflow-y-auto scrollbar">
                {
                        allUsers.length === 0 && (
                            <div className='mt-12'>
                                <div className='flex justify-center items-center my-4 text-slate-500'>
                                    <FiArrowUpLeft
                                        size={50}
                                    />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>    
                            </div>
                        )
                    }
                </div>
            </div>
            {/* Edit user details */}
            {editUserOpen && (
                <EditUserDetails onClose={()=>setEditUserOpen(false)} user={user}/>
            )}

            {/* Add friend */}
            {
                openSearchUser && (
                    <SearchUser onClose={()=>setOpenSearchUser(false)}/>
                )
            }

        </div>

    );
}
export default SideBar;