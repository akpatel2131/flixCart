const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  res.status(httpStatus.CREATED).send(cart);
});

const updateProductInCart = catchAsync(async (req, res) => {

  const quantity = req.body.quantity;
  const productId = req.body.productId;
  const user = req.user;

  if(quantity === 0){
    await cartService.deleteProductFromCart(user , productId);
    return res.status(httpStatus.NO_CONTENT).send();
  }

  const cart =await cartService.updateProductInCart( user, productId, quantity );

  return  res.status(httpStatus.OK).send(cart);
});

 const checkout = catchAsync(async (req, res) => {
  const result = await cartService.checkout(req.user);
    return res.status(204).send();
});


module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
