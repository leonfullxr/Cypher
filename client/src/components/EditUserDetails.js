import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import uploadFile from "../utils/uploadFile";
import Divider from "./Divider";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const EditUserDetails = ({ onClose, user }) => {
    const [data, setData] = useState({
        _id: user?._id,
        name: user?.name,
        profile_pic: user?.profile_pic
    });

    const [isMfaActive, setIsMfaActive] = useState(user?.isMfaActive);
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [totp, setTotp] = useState("");
    const [show2FASetup, setShow2FASetup] = useState(false);

    const uploadPhotoRef = React.useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        setData((preve) => {
            return {
                ...preve,
                name: user?.name,
                profile_pic: user?.profile_pic
            }
        })
    }, [user]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        });
    }

    const handleOpenUploadPhoto = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPhotoRef.current.click();
    }

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        const uploadPhoto = await uploadFile(file);
        setData((preve) => {
            return {
                ...preve,
                profile_pic: uploadPhoto?.url
            }
        });
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;

            const response = await axios({
                method: 'post',
                url: URL,
                data: data,
                withCredentials: true
            });

            console.log('response', response);
            toast.success(response?.data?.message);

            if (response.data.success) {
                dispatch(setUser(response.data.data))
                onClose();
            }
        } catch (error) {
            console.log(error);
            toast.error();
        }
    }

    const handleEnable2FA = async () => {
        try {
            // Call /api/2fa/setup
            const setupURL = `${process.env.REACT_APP_BACKEND_URL}/api/2fa/setup`;
            const { data } = await axios.post(setupURL, {}, { withCredentials: true });
            // data.secret and data.qrCode

            setQrCode(data.qrCode);
            setSecret(data.secret);
            setShow2FASetup(true); // Show the setup section with the QR
            toast.success("Secret generated, please verify with TOTP");
        } catch (error) {
            toast.error("Error enabling 2FA");
        }
    };

    const handleVerify2FA = async () => {
        try {
            // Call /api/2fa/verify with the TOTP token
            const verifyURL = `${process.env.REACT_APP_BACKEND_URL}/api/2fa/verify`;
            const { data } = await axios.post(
                verifyURL,
                { token: totp },
                { withCredentials: true }
            );

            if (data.message === "2FA successful") {
                toast.success("2FA enabled successfully!");
                setIsMfaActive(true);      // Mark MFA as active locally
                dispatch(setUser(data.user));
                setShow2FASetup(false);    // Hide the setup section
                setQrCode("");
                setSecret("");
                setTotp("");
            } else {
                toast.error("Invalid 2FA code");
            }
        } catch (error) {
            toast.error("Error verifying 2FA");
        }
    };

    const handleDisable2FA = async () => {
        try {
            // Call /api/2fa/reset
            const resetURL = `${process.env.REACT_APP_BACKEND_URL}/api/2fa/reset`;
            const response = await axios.post(resetURL, {}, { withCredentials: true });
            toast.success(response.data.message); // "2FA reset successful"
            setIsMfaActive(false);
        } catch (error) {
            toast.error("Error disabling 2FA");
        }
    };


    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
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
                                <button className='font-semibold' onClick={handleOpenUploadPhoto}>Change Photo</button>
                                <input
                                    type='file'
                                    id='profile_pic'
                                    className='hidden'
                                    onChange={handleUploadPhoto}
                                    ref={uploadPhotoRef}
                                />
                            </label>
                        </div>
                    </div>

                    <Divider />
                    {/* 2FA Section */}
                    <div className="mt-3">
                        <h3 className="font-bold text-sm">Two-Factor Authentication</h3>
                        {isMfaActive ? (
                            <div className="mt-2">
                                <p>2FA is currently <strong>ENABLED</strong>.</p>
                                <button
                                    type="button"
                                    onClick={handleDisable2FA}
                                    className="border border-red-500 text-red-500 rounded px-2 py-1 hover:bg-red-500 hover:text-white mt-1"
                                >
                                    Disable 2FA
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p>2FA is currently <strong>DISABLED</strong>.</p>
                                <button
                                    type="button"
                                    onClick={handleEnable2FA}
                                    className="border border-green-500 text-green-500 rounded px-2 py-1 hover:bg-green-500 hover:text-white mt-1"
                                >
                                    Enable 2FA
                                </button>
                            </div>
                        )}

                        {/* Show the setup section (QR + verification) only if the user clicked "Enable 2FA" */}
                        {show2FASetup && (
                            <div className="mt-3 border p-2 rounded bg-gray-50">
                                <p className="font-semibold text-sm">Scan this QR or enter this secret in your authenticator app:</p>
                                {qrCode && (
                                    <img src={qrCode} alt="2FA QR" className="mt-2 mb-2" />
                                )}
                                <p className="text-xs break-all">{secret}</p>

                                <div className="mt-3 flex flex-col gap-2">
                                    <label className="text-sm font-semibold">
                                        Enter the 6-digit code:
                                    </label>
                                    <input
                                        type="text"
                                        value={totp}
                                        onChange={(e) => setTotp(e.target.value)}
                                        placeholder="TOTP code"
                                        className="border rounded px-2 py-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerify2FA}
                                        className="bg-primary text-white px-3 py-1 rounded hover:bg-secondary"
                                    >
                                        Verify 2FA
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div className="flex gap-2 w-fit ml-auto mt-4">
                        <button onClick={onClose} type="button" className="border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white">
                            Cancel
                        </button>
                        <button type="submit" className="border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(EditUserDetails);
