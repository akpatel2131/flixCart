const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

const getCartByUser = async (user) => {
  let cart = await Cart.findOne({email: user.email});
  if( !cart){
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart")
  };

  return cart;
};

const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({email: user.email});

  if(!cart){
    try{
      cart = await Cart.create({
       email:user.email,
       cartItems:[],
       paymentOption:config.default_payment_option,
       });
       await cart.save();
   }catch(e){
     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"User cart creation failed");
   }
  }

  if(cart == null){
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User does not have a cart")
  }

  if(cart.cartItems.some((item)=>item.product._id == productId))
{
  throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
}

const product = await Product.findOne({_id:productId})
if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST,"product doesn't exist in the database")
}

cart.cartItems.push({ product,quantity})
await cart.save();

return cart;
};

const updateProductInCart = async (user, productId, quantity) => {

  let cart = await Cart.findOne({email: user.email});

  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }

  let product = await Product.findOne({ _id: productId })

  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database")
  }

  const productIndex = cart.cartItems.findIndex(item => item.product._id == productId);

  if(productIndex === -1){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart")
  }else{
    cart.cartItems[productIndex].quantity = quantity;
  }

  await cart.save();
  return cart;
};

const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({email: user.email});

  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart")
  }

  const productIndex = cart.cartItems.findIndex(item => item.product._id == productId);
 
  if(productIndex ===-1){
   throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
  }
 
  cart.cartItems.splice(productIndex,1)
  await cart.save();
};

const checkout = async (user) => {
  const cart = await Cart.findOne({email:user.email})

  if(cart == null){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
  }
  if(cart.cartItems.length==0)
  {
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have items in the cart");
  }

  const hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if(!hasSetNonDefaultAddress)
  throw new ApiError(httpStatus.BAD_REQUEST,"Address not set");

  const total = cart.cartItems.reduce((acc,item)=>{
    acc=acc+(item.product.cost *item.quantity);
    return acc;
  },0)

  if(total > user.walletMoney){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have sufficient balance")
  }
  user.walletMoney -= total;
    await user.save();

  cart.cartItems= []
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
