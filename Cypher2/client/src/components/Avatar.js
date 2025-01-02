import React, { useMemo } from "react";
import { PiUserCircle } from "react-icons/pi";

const Avatar = ({ userId, name, imageUrl, width, height }) => {
    let avatarName = "";

    if (name) {
        const nameArray = name?.split(" ");
        if (nameArray.length > 1) {
            avatarName = nameArray[0][0].toUpperCase() + nameArray[1][0].toUpperCase();
        } else {
            avatarName = nameArray[0][0].toUpperCase();
        }
    }

    const backgroundColor = [
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
        "bg-emerald-200"
    ];

    const randomColor = useMemo(() => {
        return backgroundColor[Math.floor(Math.random() * backgroundColor.length)];
    }, [userId]); // Depend on userId or another unique identifier

    return (
        <div
            className="text-slate-800 overflow-hidden rounded-full font-bold relative"
            style={{ width: width + "px", height: height + "px" }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    width={width}
                    height={height}
                    className="overflow-hidden rounded-full"
                />
            ) : name ? (
                <div
                    style={{ width: width + "px", height: height + "px" }}
                    className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${randomColor}`}
                >
                    {avatarName}
                </div>
            ) : (
                <PiUserCircle size={width} />
            )}
        </div>
    );
};

export default Avatar;
