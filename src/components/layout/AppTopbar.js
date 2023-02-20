const AppTopbar = (props) => {
  return (
    <div className="layout-topbar">
      <a className="layout-topbar-logo">
        <>
          <span>IMS</span>
        </>
      </a>

      <div className="layout-topbar-menu">
        <button type="button" className="p-link layout-topbar-button">
          <i className="pi pi-user"></i>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default AppTopbar;
