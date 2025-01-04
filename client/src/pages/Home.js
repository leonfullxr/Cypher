import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout, setUser } from "../redux/userSlice";
import SideBar from "../components/SideBar";

const Home = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    console.log("redux user", user);

    const fetchUserDetails = async () => {
        try {
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
            const response = await axios({
                method :'GET',
                url : URL,
                withCredentials : true
            })

            dispatch(setUser(response.data));

            if(response.data.logout){
                dispatch(logout());
                navigate('/email');
            }
            console.log("current user details", response);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchUserDetails();
    },[]);

    return (
        <div className="grid lg:grid.cols-[310px,1fr] h-screen max-h-screen">
            <section className="bg-white">
                <SideBar/>
            </section>

        {/* Main content */}
            <section>
                <Outlet/>
            </section>
        </div>
    );
}

export default Home;