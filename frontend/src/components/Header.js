import { Button } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import Logo from "./Logo";
import "./Header.css";

const Header = ({ search, children }) => {
  const history = useHistory();

  const root = () => {
    history.push("/");
  };

  const explore = () => {
    history.push("/products");
  };

  const register = () => {
    history.push("/register");
  };

  const login = () => {
    history.push("/login");
  };

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    history.push("/");
  };

  return (
    <div className={search ? "header" : "checkout-header"}>
      <div className="header-title" onClick={root}>
        <Logo />
      </div>

      {children}

      {/* Display links based on if the user's logged in or not */}
      <div className="header-action">
        {localStorage.getItem("username") ? (
          <>
            <img src="avatar.png" alt="profile" className="profile-image"></img>

            <div className="header-info">
              {localStorage.getItem("username")}
            </div>

            <Button type="primary" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <div className="header-link" onClick={explore}>
              Explore
            </div>

            <div className="header-link" onClick={login}>
              Login
            </div>

            <div className="header-link">
              <Button type="primary" onClick={register}>
                Register
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
