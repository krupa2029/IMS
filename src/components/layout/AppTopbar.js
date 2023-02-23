import { useContext } from "react";
import { SiDropbox } from "react-icons/si";
import AuthContext from "../../store/auth-context";

const AppTopbar = (props) => {
  const {userDetails} = useContext(AuthContext);
  const userName = `${userDetails?.firstName} ${userDetails?.lastName}`
  return (
    <div className="layout-topbar">
      <a className="layout-topbar-logo">
        <>
          <SiDropbox className="mr-2"/>
          <span>IMS</span>
        </>
      </a>

      <div className="layout-topbar-menu">
      <div className="text-lg text-white flex align-items-center">
        <span>{userName}</span>
      </div>
        <button type="button" className="p-link layout-topbar-button">
          <i className="pi pi-user"></i>
        </button>
      </div>
    </div>
  );
};

export default AppTopbar;
