import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";

const Register = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateInput = () => {
    if (!username) {
      message.error("Username is a required field");
      return false;
    }
    if (username.length < 6) {
      message.error("Username must be at least 6 characters");
      return false;
    }
    if (username.length > 32) {
      message.error("Username must be at most 32 characters");
      return false;
    }
    if (!password) {
      message.error("Password is a required field");
      return false;
    }
    if (password.length < 6) {
      message.error("Password must be at least 8 characters");
      return false;
    }
    if (password.length > 32) {
      message.error("Password must be at most 32 characters");
      return false;
    }
    if (password !== confirmPassword) {
      message.error("Passwords do not match");
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
        await fetch(`${config.endpoint}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: username,
            phone: phoneNumber,
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

  const register = async () => {
    if (validateInput()) {
      const response = await performAPICall();
      if (response) {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        message.success("Registered successfully");
        history.push("/login");
      }
    }
  };

  return (
    <>
      {/* Display Header */}
      <Header history={history} />

      {/* Display Register fields */}
      <div className="flex-container">
        <div className="register-container container">
          <h1>Make an account</h1>

          {/* Antd component which renders a formatted <input type="text"> field */}
          <Input
            className="input-field"
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className="input-field"
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Mobile Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Input
            className="input-field"
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Antd component which renders a formatted <input type="password"> field */}
          <Input.Password
            className="input-field"
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Antd component which renders a formatted <input type="password"> field */}
          <Input.Password
            className="input-field"
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Antd component which renders a formatted <button type="button"> field */}
          <Button loading={loading} type="primary" onClick={register}>
            Register
          </Button>
        </div>
      </div>

      {/* Display the footer */}
      <Footer />
    </>
  );
};

export default Register;
