const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

const getUser = catchAsync(async (req, res) => {

  let Data;
    if(req.query.q === "address"){
      Data = await userService.getUserAddressById(req.params.userId);
      Data = {
        email: Data.email,
        address : Data.address
      }
    }else{
      Data = await userService.getUserById(req.params.userId);
    }
    
      if(!Data){
        throw new ApiError(httpStatus.NOT_FOUND,"User not found")
      }

      if(Data.email !== req.user.email){
        throw new ApiError(httpStatus.FORBIDDEN)
      }

      if(req.query.q === "address"){
        Data={
          address : Data.address
        }
      }
  
      res.status(httpStatus.OK).send(Data)
});


const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

module.exports = {
  getUser,
  setAddress,
};
