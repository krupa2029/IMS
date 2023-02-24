import { NavLink, useNavigate } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";

const AppSidebar = () => {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    authCtx.logout();
    navigate("/login");
  };

  return (
    <div className="layout-menu">
      <ul>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active-route" : undefined
            }
            tabIndex="0"
          >
            <i
              className="layout-menuitem-icon
                pi pi-fw pi-list"
            ></i>
            <div className="layout-menuitem-text">Dashboard</div>
            <Ripple />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/checkout-report"
            className={({ isActive }) =>
              isActive ? "active-route" : undefined
            }
            tabIndex="0"
          >
            <i
              className="layout-menuitem-icon
                pi pi-fw pi-check-square"
            ></i>
            <div className="layout-menuitem-text">Checkout Report</div>
            <Ripple />
          </NavLink>
        </li>

        <li>
          <a onClick={handleLogout} tabIndex="0">
            <i className="layout-menuitem-icon pi pi-fw pi-sign-out"></i>
            <div className="layout-menuitem-text">Logout</div>
            <Ripple />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default AppSidebar;
