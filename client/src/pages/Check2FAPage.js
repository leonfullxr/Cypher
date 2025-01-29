import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Check2FAPage = () => {
  const [totp, setTotp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/2fa/verify`;
      const response = await axios.post(
        URL,
        { token: totp },
        { withCredentials: true }
      );

      if (response.data.message === "2FA successful") {
        toast.success("2FA verified successfully!");

        navigate("/");
      } else {
        toast.error("Invalid 2FA code");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error verifying 2FA");
    }
  };

  return (
    <div className="mt-5">
      <div className="bg-white w-full max-w-md rounded p-4 mx-auto">
        <h2 className="text-center">Enter your 2FA code</h2>
        <form className="mt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="6-digit code"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            required
            className="bg-slate-100 px-2 py-1 focus:outline-primary w-full"
          />
          <button
            type="submit"
            className="bg-secondary txt-lg px-4 py-1 hover:bg-primary rounded mt-2 font-bold text-white w-full"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default Check2FAPage;
