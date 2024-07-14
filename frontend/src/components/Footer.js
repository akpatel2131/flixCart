import { Footer as AntdFooter } from "antd/lib/layout/layout";
import React from "react";
import Logo from "./Logo"
import "./Footer.css";

const Footer = () => {
  return (
    <AntdFooter className="footer">
      <Logo className="footer-logo"/>
    </AntdFooter>
  );
};

export default Footer;

