import React, { useState } from "react";
import { useCallback } from "react";

const AuthContext = React.createContext({
  userData: "",
  isLoggedIn: false,
  logout: () => {},
});

export const AuthContextProvider = (props) => {
  const storedUserData = localStorage.getItem("userData");
  const userDataJson = JSON.parse(storedUserData);

  const [userData, setUserData] = useState(userDataJson);

  const token = userData?.accessToken;

  const userIsLoggedIn = !!token;

  const loginHandler = (userData) => {
    setUserData(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logoutHandler = useCallback(() => {
    localStorage.removeItem("userData");
    setUserData(null);
  },[]);

  const contextValue = {
    token: token, 
    userDetails: userData?.userDetails,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
