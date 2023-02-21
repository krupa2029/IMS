import React, { useContext } from "react";
import Layout from "./components/layout/Layout";
import CheckoutReport from "./pages/CheckoutReport";
import LoginPage from "./pages/LoginPage";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AuthContext from "./store/auth-context";
import ManageInventory from "./pages/ManageInventory";

function App() {
  const authCtx = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      path: "/login",
      element: !authCtx.isLoggedIn ? <LoginPage /> : <Navigate to="/dashboard" />,
    },
    {
      element: authCtx.isLoggedIn ? <Layout /> : <Navigate to="/login" />,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" />
        },
        {
          path: "/dashboard",
          element: <ManageInventory />,
        },
        {
          path: "/checkout-report",
          element: <CheckoutReport />,
        },
      ],
    },
  ]);
 
  return <RouterProvider router={router} />
}

export default App;
