import React from "react";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import CheckoutReport from "./pages/CheckoutReport";
import LoginPage from "./pages/LoginPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
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
