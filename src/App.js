import React, { useContext } from "react";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import CheckoutReport from "./pages/CheckoutReport";
import LoginPage from "./pages/LoginPage";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AuthContext from "./store/auth-context";


function App() {
  const authCtx = useContext(AuthContext);
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
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
          element: <Dashboard />,
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
