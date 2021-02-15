import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User, { IUser } from "../models/user-model";
import RefreshToken from "../models/refreshToken-model";
import { IRole } from "../helpers/role";

export {
  authenticate,
  refreshToken,
  revokeToken,
  getAll,
  getById,
  getRefreshTokens,
  createNewUser,
};

async function authenticate(
  email: string,
  password: string,
  ipAddress: string
) {
  //find user by email or name
  let user: any = {};
  if (email.includes("@")) {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({ name: email });
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw "Username or password is incorrect";
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(user);
  const refreshToken = generateRefreshToken(user, ipAddress);

  // save refresh token
  await refreshToken.save();

  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}

async function refreshToken(token: string, ipAddress: string) {
  const refreshToken = await getRefreshToken(token);
  const { userId } = refreshToken;
  const user = await User.findById(userId);
  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(user!, ipAddress);
  refreshToken.revoked = new Date();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(user!);

  // return basic details and tokens
  return {
    ...basicDetails(user!),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}

async function revokeToken(token: string, ipAddress: string) {
  const refreshToken = await getRefreshToken(token);
  // revoke token and save
  refreshToken.revoked = new Date();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function getAll() {
  const users = await User.find();
  return users.map((x) => basicDetails(x));
}

async function getById(id: string) {
  const user = await getUser(id);
  return basicDetails(user);
}

async function getRefreshTokens(userId: string) {
  // check that user exists
  await getUser(userId);

  // return refresh tokens for user
  const refreshTokens = await RefreshToken.find({ userId: userId });
  return refreshTokens;
}

// helper functions

async function getUser(id: string) {
  //if (!db.isValidId(id)) throw 'User not found';
  const user = await User.findById(id);
  if (!user) throw "User not found";
  return user;
}

async function getRefreshToken(token: string) {
  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function generateJwtToken(user: IUser) {
  // create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, `${process.env.JWT_KEY}`, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user: IUser, ipAddress: string) {
  // create a refresh token that expires in 7 days
  return new RefreshToken({
    userId: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(user: IUser) {
  const { id, name, email, role, blogPosts } = user;
  return { id, name, email, role, blogPosts };
}

async function createNewUser(
  name: string,
  email: string,
  password: string,
  role: IRole
) {
  const user = new User({
    name: name,
    email: email,
    blogPosts: [],
    password: bcrypt.hashSync(password, 10),
    role: role,
  });
  await user.save();

  return {
    ...basicDetails(user!),
  };
}
