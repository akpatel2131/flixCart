const {User} = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

const getUserById = async(id)=>{
    const result = await User.findOne({"_id" : id});
    return result
 }

 const getUserByEmail= async(email)=>{
    const result = await User.findOne({email: email});
    return result;
 }

const createUser = async (user)=>{
    const IsEmailTake = await User.isEmailTaken(user.email);
    if(IsEmailTake){
        throw new ApiError(httpStatus.OK, "Email already taken")
    }

    const HashPassword = await bcrypt.hash(user.password, 10);
    const result = await User.create({...user, password: HashPassword});
    return result;
}

 const getUserAddressById = async (id) => {
    return User.findOne({_id : id}, {email: 1, address: 1});
};

const setAddress = async (user, newAddress) => {
    user.address = newAddress;
    await user.save();
  
    return user.address;
  };

module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    setAddress,
    getUserAddressById
};
