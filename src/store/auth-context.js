import React, { useState } from "react";
import { useCallback } from "react";

const AuthContext = React.createContext({
  token: null, 
  userData: null,
  permissions: null,
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
  setUserPermissionData: (permissionData) => {},
});

export const AuthContextProvider = (props) => {
  const storedToken = localStorage.getItem("accessToken");

  const [token, setToken] = useState(storedToken);
  const [userData, setUserData] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const userIsLoggedIn = !!token; 
  
  const loginHandler = (token) => {
    localStorage.setItem("accessToken", token);
    setToken(token);
  };

  const logoutHandler = useCallback(() => {
    localStorage.removeItem("accessToken");
    setToken(null);
  },[]);

  const userPermissionHandler = (userDetails, permissionData) => {
    setUserData(userDetails)
    setPermissions(permissionData);
  }

  const contextValue = {
    token: token, 
    userData: userData,
    permissions: permissions,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
    setUserPermissionData: userPermissionHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
