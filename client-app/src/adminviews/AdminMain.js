import { Outlet, Link } from "react-router-dom";
import "./AdminMain.css";

function AdminMain() {
  return (
    <div className="adminMainRoot">

      <div className="adminMainNav">
        <Link to="adminlogin">Login</Link>
        <Link to="adminreg">Register</Link>
      </div>

      <div className="adminMainOutlet">
        <Outlet />
      </div>

    </div>
  );
}

export default AdminMain;