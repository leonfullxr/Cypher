import React, { useMemo } from "react";
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from "react-redux";

const Avatar = ({userId, name, imageUrl, width, height }) => {
    const onlineUser = useSelector(state => state?.user?.onlineUser);

    let avatarName = "";

    if (name) {
        const nameArray = name?.split(" ");
        if (nameArray.length > 1) {
            avatarName = nameArray[0][0].toUpperCase() + nameArray[1][0]
        } else {
            avatarName = nameArray[0][0].toUpperCase();
        }
    }

    const backgroundColor = useMemo(() => [
        "bg-blue-200",
        "bg-green-200",
        "bg-yellow-200",
        "bg-red-200",
        "bg-purple-200",
        "bg-indigo-200",
        "bg-pink-200",
        "bg-gray-200",
        "bg-slate-200",
        "bg-cyan-200",
        "bg-sky-200",
        "bg-amber-200",
        "bg-lime-200",
        "bg-emerald-200",
    ], []);

    const randomNumber = Math.floor(Math.random() * 9);

    const isOnline = onlineUser.includes(userId);

    return (
        <div
            className="text-slate-800 overflow-hidden rounded-full font-bold relative"
            style={{ width: width + "px", height: height + "px" }}
        >
            {
                imageUrl ? (
                    <img
                        src={imageUrl}
                        width={width}
                        height={height}
                        alt={name}
                        className='overflow-hidden rounded-full'
                    />
                ) : (
                    name ? (
                        <div  style={{width : width+"px", height : height+"px" }} className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${backgroundColor[randomNumber]}`}>
                            {avatarName}
                        </div>
                    ) :(
                    <PiUserCircle
                        size={width}
                    />
                    )
                )
            }

            {
                isOnline && (
                    <div className='bg-green-600 p-1 absolute bottom-2 right-1 z-10 rounded-full'></div>
                )
            }
        </div>
    );
};

export default Avatar;
