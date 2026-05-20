import { Outlet, Link } from "react-router-dom";
import "./VenderMain.css";

function VenderMain() {
  return (
    <div className="venderMainRoot">

      <div className="venderMainNav">
        <Link to="venderlogin">Login</Link>
        <Link to="venderreg">Register</Link>
      </div>

      <div className="venderMainOutlet">
        <Outlet />
      </div>

    </div>
  );
}

export default VenderMain;