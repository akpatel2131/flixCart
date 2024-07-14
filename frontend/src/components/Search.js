import { Input, message } from "antd";
import React, {useState, useRef, useEffect} from "react";
import { withRouter } from "react-router-dom";
import { config } from "../App";

import Cart from "./Cart";

import Header from "./Header";
import Product from "./Product";
import { Row, Col } from "antd";
import Footer from "./Footer";
import "./Search.css";

const Search = (props) => {
  const cartRef = useRef(null);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const validateResponse = (errored, response) => {
    if (errored || (!response.length && !response.message)) {
      message.error(
        "Could not fetch products. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }

    if (!response.length) {
      message.error(response.message || "No products found in database");
      return false;
    }

    return true;
  };

  const performAPICall = async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (await fetch(`${config.endpoint}/products`)).json();
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response)) {
      return response;
    }
  };

  const debounceSearch = (event) => {
    const value = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setDebounceTimeout(setTimeout(() => {
      search(value);
    }, 300));
  };

  const search = (text) => {
    setFilteredProducts(products.filter(
      (product) =>
        product.name.toUpperCase().includes(text.toUpperCase()) ||
        product.category.toUpperCase().includes(text.toUpperCase())
    ));
  };

  const getProducts = async () => {
    const response = await performAPICall();

    if (response) {
      setProducts(response);
      setFilteredProducts(response.slice());
    }
  };

  useEffect(() => {
    getProducts();

    if (localStorage.getItem("email") && localStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, [getProducts]);

  const getProductElement = (product) => {
    return (
      <Col xs={24} sm={12} xl={6} key={product._id}>
        <Product
          product={product}
          addToCart={() => {
            if (loggedIn) {
              cartRef.current.postToCart(product._id, 1, true);
            } else {
              props.history.push("/login");
            }
          }}
        />
      </Col>
    );
  };

  return (
    <>
      {/* Display Header with Search bar */}
      <Header history={props.history}>
        <Input.Search
          placeholder="Search"
          onSearch={search}
          onChange={debounceSearch}
          enterButton={true}
        />
      </Header>

      {/* Use Antd Row/Col components to display products and cart as columns in the same row*/}
      <Row justify="center">
        {/* Display products */}
        <Col
          xs={{ span: 24 }}
          xl={{ span: loggedIn && products.length ? 18 : 24 }}
        >
          <div className="search-container ">
            {/* Display each product item wrapped in a Col component */}
            <Row>
              {products.length !== 0 ? (
                filteredProducts.map((product) =>
                  getProductElement(product)
                )
              ) : loading ? (
                <div className="loading-text">Loading products...</div>
              ) : (
                <div className="loading-text">No products to list</div>
              )}
            </Row>
          </div>
        </Col>

        {/* Display cart */}
        {loggedIn && products.length && (
          <Col xs={{ span: 24 }} md={{ span: 12 }} xl={{ span: 6 }} className="search-cart">
            <div>
              <Cart
                ref={cartRef}
                products={products}
                history={props.history}
                token={localStorage.getItem("token")}
              />
            </div>
          </Col>
        )}
      </Row>

      {/* Display the footer */}
      <Footer />
    </>
  );
}

export default withRouter(Search);

