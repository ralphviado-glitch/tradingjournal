import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/index.css";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="sidebar d-flex flex-column p-3">
      <h5 className="mb-4">Trading Journal</h5>

      <ul className="nav flex-column flex-grow-1">
        <li className="nav-item">
          <Link className={`nav-link ${isActive("/dashboard")}`} to="/dashboard">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive("/trades")}`} to="/trades">
            Trades
          </Link>
        </li>
      </ul>

      <button
        className="btn btn-outline-danger w-100 mt-3"
        onClick={logout}
      >
        Logout
      </button>
    </nav>
  );
}
