import { Outlet, Link } from "react-router-dom";
import "./CustomerMain.css";

function CustomerMain() {
  return (
    <div className="customerMainRoot">

      <div className="customerMainNav">
        <Link to="customerlogin">Login</Link>
        <Link to="customerreg">Register</Link>
      </div>

      <div className="customerMainOutlet">
        <Outlet />
      </div>

    </div>
  );
}

export default CustomerMain;