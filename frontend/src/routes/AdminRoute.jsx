// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function AdminRoute({ children }) {
//   const { token, role } = useContext(AuthContext);

//   if (!token || role !== "ADMIN") {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }