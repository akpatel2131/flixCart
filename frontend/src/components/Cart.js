import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, message, Spin, InputNumber } from "antd";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { config } from "../App";
import "./Cart.css";

const Cart = forwardRef(({ products, history, token, checkout }, ref) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    postToCart(productId, qty, fromAddToCartButton) {
      handlePostToCart(productId, qty, fromAddToCartButton);
    },
  }));

  const validateResponse = (errored, response) => {
    if (errored) {
      message.error(
        "Could not update cart. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    } else if (response.message) {
      message.error(response.message);
      return false;
    }

    return true;
  };

  const getCart = async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handlePostToCart = async (productId, qty, fromAddToCartButton) => {
    let response = {};
    let errored = false;
    let statusCode;

    setLoading(true);

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            quantity: qty,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response, statusCode)) {
      await refreshCart();
    }
  };

  const putToCart = async (productId, qty) => {
    let response = {};
    let errored = false;
    let statusCode;

    setLoading(true);

    try {
      let response_object = await fetch(`${config.endpoint}/cart`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: qty,
        }),
      });

      statusCode = response_object.status;
      if (statusCode !== 204) {
        response = await response_object.json();
      }
    } catch (e) {
      errored = true;
    }

    setLoading(false);
    if (
      statusCode === "204" ||
      validateResponse(errored, response, statusCode)
    ) {
      await refreshCart();
    }
  };

  const refreshCart = async () => {
    const cart = await getCart();

    if (cart && cart.cartItems) {
      setItems(
        cart.cartItems.map((item) => ({
          ...item,
          product: products.find((product) => product._id === item.product._id),
        }))
      );
    }
  };

  const calculateTotalAmount = () => {
    return items.length
      ? items.reduce(
          (total, item) => total + item.product.cost * item.quantity,
          0
        )
      : 0;
  };

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartAmount", calculateTotalAmount())
  },[items])

  return (
    <div className={["cart", checkout ? "checkout" : ""].join(" ")}>
      {/* Display cart items or a text banner if cart is empty */}
      {items.length > 0 ? (
        <>
          {/* Display a card view for each product in the cart */}
          {items.map((item) => (
            <Card className="cart-item" key={item.productId}>
              {/* Display product image */}
              <img
                className="cart-item-image"
                alt={item.product.name}
                src={item.product.image}
              />

              {/* Display product details*/}
              <div className="cart-parent">
                {/* Display product name, category and total cost */}
                <div className="cart-item-info">
                  <div>
                    <div className="cart-item-name">{item.product?.name}</div>

                    <div className="cart-item-category">
                      {item.product.category}
                    </div>
                  </div>

                  <div className="cart-item-cost">
                    ₹{item.product.cost * item.quantity}
                  </div>
                </div>

                {/* Display field to update quantity or a static quantity text */}
                <div className="cart-item-qty">
                  {checkout ? (
                    <>
                      <div className="cart-item-qty-fixed"></div>
                      <div className="cart-item-qty-fixed">
                        Qty: {item.quantity}
                      </div>
                    </>
                  ) : (
                    <InputNumber
                      min={0}
                      max={10}
                      value={item.quantity}
                      onChange={(value) => {
                        putToCart(item.product?._id, value);
                      }}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Display cart summary */}
          <div className="total">
            <h2>Total</h2>

            {/* Display net quantity of items in the cart */}
            <div className="total-item">
              <div>Products</div>
              <div>
                {items.reduce(function (sum, item) {
                  return sum + item.quantity;
                }, 0)}
              </div>
            </div>

            {/* Display the total cost of items in the cart */}
            <div className="total-item">
              <div>Sub Total</div>
              <div>₹{calculateTotalAmount()}</div>
            </div>

            {/* Display shipping cost */}
            <div className="total-item">
              <div>Shipping</div>
              <div>N/A</div>
            </div>
            <hr></hr>

            {/* Display the sum user has to pay while checking out */}
            <div className="total-item">
              <div>Total</div>
              <div>₹{calculateTotalAmount()}</div>
            </div>
          </div>
        </>
      ) : (
        // Display a static text banner if cart is empty
        <div className="loading-text">
          Add an item to cart and it will show up here
          <br />
          <br />
        </div>
      )}

      {/* Display a "Checkout" button */}

      {!checkout && (
        <Button
          className="ant-btn-warning"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => {
            if (items.length) {
              history.push("/checkout");
            } else {
              message.error("You must add items to cart first");
            }
          }}
        >
          <strong> Checkout</strong>
        </Button>
      )}

      {/* Display a loading icon if the "loading" state variable is true */}
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
});

export default Cart;
