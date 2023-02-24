import React, { useContext, useEffect } from "react";
import { Outlet } from "react-router";
import ApiServices from "../../api/ApiServices";
import useHttp from "../../hooks/use-http";
import AuthContext from "../../store/auth-context";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";

const Layout = () => {
  const authCtx = useContext(AuthContext);
  const { sendRequest, isLoading, data, error } = useHttp(
    ApiServices.getUserDetails,
    true
  );

  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

  useEffect(() => {
    if (!isLoading && error) {
      authCtx.logout();
    }
  
    if (!isLoading && !error && data) {
      authCtx.setUserPermissionData(data, data.roleDetails.permissions);
    }
  }, [isLoading, error, data]);

  return (
    authCtx.permissions && (
      <div className="layout-wrapper layout-theme-light layout-static p-ripple-disabled">
        <AppTopbar />
        <div className="layout-sidebar">
          <AppSidebar />
        </div>
        <div className="layout-main-container">
          <div className="layout-main">
            <Outlet />
          </div>
        </div>
        <div className="layout-mask"></div>
      </div>
    )
  );
};

export default Layout;
