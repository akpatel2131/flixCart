import React from "react";

import "./Logo.css";

const Logo = ({ className }) => {
  return (
    <div className={`companny-logo ${className}`}>
      <span className="flix">Flix</span>Cart
    </div>
  );
}

export default Logo
