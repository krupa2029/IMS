import React, { useContext } from "react";
import Layout from "./components/layout/Layout";
import CheckoutReport from "./pages/CheckoutReport";
import LoginPage from "./pages/LoginPage";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AuthContext from "./store/auth-context";
import ManageInventory from "./pages/ManageInventory";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: !isLoggedIn ? <LoginPage /> : <Navigate to="/dashboard" />,
    },
    {
      element: isLoggedIn ? <Layout /> : <Navigate to="/login" />,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" />,
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
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
