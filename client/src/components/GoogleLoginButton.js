import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setToken } from "../redux/userSlice";

const GoogleLoginButton = ({ dispatch }) => {
    const navigate = useNavigate();

    const handleGoogleResponse = async (response) => {
        try {
            const decoded = jwtDecode(response.credential);
            const email = decoded.email;
            const googleId = decoded.sub;

            const isNewUser = await checkIfNewUser(email);

            let publicKey = null;
            let encryptedPrivateKey = null;

            if (isNewUser) {
                const crypt = new JSEncrypt({ default_key_size: 2048 });
                crypt.getKey();
                publicKey = crypt.getPublicKey();
                const privateKey = crypt.getPrivateKey();

                const aesKey = CryptoJS.SHA256(googleId).toString();
                encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, aesKey).toString();
                localStorage.setItem("privateKey", privateKey);
            }

            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`,
                { credential: response.credential, publicKey, encryptedPrivateKey },
                { withCredentials: true }
            );

            localStorage.setItem("token", res.data.token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;            
            dispatch(setToken(res.data.token));

            if (!isNewUser) {
                const aesKey = CryptoJS.SHA256(googleId).toString();
                const bytes = CryptoJS.AES.decrypt(res.data.encryptedPrivateKey, aesKey);
                const privateKey = bytes.toString(CryptoJS.enc.Utf8);
                localStorage.setItem("privateKey", privateKey);
            }

            navigate(res.data.isMfaActive ? "/mfa" : "/");
        } catch (err) {
            toast.error("Google auth failed");
            console.error("Google auth error", err);
        }
    };

    const checkIfNewUser = async (email) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/email`, { email }, {withCredentials: true});
            return false;
        } catch {
            return true;
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleGoogleResponse}
            onError={() => toast.error("Google login failed")}
            useOneTap
        />
    );
};

export default GoogleLoginButton;
