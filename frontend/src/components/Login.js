import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";

const Login = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateInput = () => {
    if (!email) {
      message.error("Email is a required field");
      return false;
    }
    if (!password) {
      message.error("Password is a required field");
      return false;
    }
    return true;
  };

  const validateResponse = (errored, response) => {
    if (errored || (!response.tokens && !response.message)) {
      message.error(
        "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }
    if (!response.tokens) {
      message.error(response.message);
      return false;
    }
    return true;
  };

  const performAPICall = async () => {
    let response = {};
    let errored = false;
    setLoading(true);
    try {
      response = await (
        await fetch(`${config.endpoint}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }
    setLoading(false);
    if (validateResponse(errored, response)) {
      return response;
    }
  };

  const persistLogin = (token, email, balance, name, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("balance", balance);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", userId);
    localStorage.setItem("cartAmount", null)
  };

  const login = async () => {
    if (validateInput()) {
      const response = await performAPICall();
      if (response) {
        persistLogin(
          response.tokens.access.token,
          response.user.email,
          response.user.walletMoney,
          response.user.name,
          response.user._id
        );
        setEmail("");
        setPassword("");
        message.success("Logged in successfully");
        history.push("/products");
      }
    }
  };

  return (
    <>
      {/* Display Header */}
      <Header history={history} />

      {/* Display Login fields */}
      <div className="flex-container">
        <div className="login-container container">
          <h1>Login to FlixCart</h1>

          <Input
            className="input-field"
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input.Password
            className="input-field"
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button loading={loading} type="primary" onClick={login}>
            Login
          </Button>
        </div>
      </div>

      {/* Display the footer */}
      <Footer />
    </>
  );
};

export default Login;
