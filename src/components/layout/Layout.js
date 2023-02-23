import React from "react";
import { Outlet } from "react-router";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";

const Layout = (props) => {
  return (
    <div className="layout-wrapper layout-theme-light layout-static p-ripple-disabled">
      <AppTopbar/>
      <div className="layout-sidebar">
        <AppSidebar />
      </div>
      <div className="layout-main-container">
        <div className="layout-main">
          <Outlet/>
        </div>
      </div>
      <div className="layout-mask"></div>
    </div>
  );
};

export default Layout;
