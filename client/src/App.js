import './App.css';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <>
        <Toaster />
        <main>
          <Outlet />
        </main>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;

/** TODO: Changes to add --> add routing protected routes **/
// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Home from "./pages/Home";
// import RegisterPage from "./pages/RegisterPage";
// import LoginPage from "./pages/LoginPage";
// import MessagePage from "./pages/MessagePage";
// import ProtectedRoute from "./components/ProtectedRoute"; // Crear este componente

// const App = () => {
//     return (
//         <Router>
//             <Routes>
//                 {/* Rutas públicas */}
//                 <Route path="/register" element={<RegisterPage />} />
//                 <Route path="/login" element={<LoginPage />} />

//                 {/* Rutas protegidas */}
//                 <Route element={<ProtectedRoute />}>
//                     <Route path="/" element={<Home />}>
//                         <Route path=":userId" element={<MessagePage />} />
//                         {/* Otras rutas protegidas */}
//                     </Route>
//                 </Route>

//                 {/* Redirigir rutas desconocidas */}
//                 <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//         </Router>
//     );
// };

// export default App;

/** The protected route file **/
// components/ProtectedRoute.js
// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = () => {
//     const user = useSelector((state) => state?.user);

//     // Si el usuario no está autenticado, redirige a /register
//     if (!user?._id) {
//         return <Navigate to="/register" replace />;
//     }

//     // Si está autenticado, renderiza las rutas protegidas
//     return <Outlet />;
// };

// export default ProtectedRoute;

// redux/userSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     _id: null,
//     name: "",
//     email: "",
//     profile_pic: "",
//     publicKey: "",
//     socketConnection: null,
//     onlineUsers: [],
//     // Otros estados relevantes
// };

// const userSlice = createSlice({
//     name: "user",
//     initialState,
//     reducers: {
//         setUser: (state, action) => {
//             return { ...state, ...action.payload };
//         },
//         logout: () => initialState,
//         setSocketConnection: (state, action) => {
//             state.socketConnection = action.payload;
//         },
//         setOnlineUser: (state, action) => {
//             state.onlineUsers = action.payload;
//         },
//         // Otros reducers relevantes
//     }
// });

// export const { setUser, logout, setSocketConnection, setOnlineUser } = userSlice.actions;
// export default userSlice.reducer;
