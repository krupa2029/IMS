import { NavLink } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Fragment } from "react";

const AppSidebar = () => {
  const handleLogout = () => {};

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
                pi pi-fw pi-id-card"
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
          <NavLink onClick={handleLogout} tabIndex="0">
            <i className="layout-menuitem-icon pi pi-fw pi-sign-out"></i>
            <div className="layout-menuitem-text">Logout</div>
            <Ripple />
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AppSidebar;
