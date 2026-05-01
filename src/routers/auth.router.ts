import { Router, Request, Response } from "express";
import session from "express-session";

import {
  getOTP,
  isUserEmailExist,
  isUserPhoneExist,
  isUserUserNameExist,
  loginUser,
  registerUser,
  resetPassword,
  resendOTP,
  resetPasswordLink,
  logoutUser,
  captcha,
} from "../controllers/auth.controller";
import {
  authForgetPaths,
  valOtpage,
} from "../middleware/validateforgetpassword.middleware";
import jwt, { verify } from "jsonwebtoken";
import { verifyCaptcha } from "../middleware/verifyCAPTCHA";

const router = Router();


router.use(
  session({
    secret: "This is Secret Key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);


//Route to genrate captcha and send svg to client
router.get("/getcaptcha", async (req: Request, res: Response) => {
  const captcha_data = captcha();

  req.session.captcha = {
    text: captcha_data.text,
    expiresAt: Date.now() + 10 * 60 * 1000, 
  };

  res.type("svg");
  res.send(captcha_data.data);
});


//Route to chcek is email , phone , user_name is taken or not 
router.post("/checkEmail", isUserEmailExist);
router.post("/checkPhone", isUserPhoneExist);
router.post("/checkUserName", isUserUserNameExist);



//Route to / if already logged in then home page else login
router.get("/", (req: Request, res: Response) => {
  if (req.cookies.jwt_token) {
    return res.redirect("/user");
  }
  return res.render("login");
});

//Route to login page
router.get("/login", (req: Request, res: Response) => {
  if (req.cookies.jwt_token) {
    return res.redirect("/user");
  }
  return res.render("login");
});


//Route to SignUp ... Register USers page 
router.get("/signup", (req: Request, res: Response) => {
  return res.render("signup");
});

//Route to store user registration with captcha middleware
router.post("/signup", verifyCaptcha ,registerUser);


//Route to login user with Credentials
router.post("/login", verifyCaptcha ,loginUser);


//Route to logout user
router.get("/logout", logoutUser);


//Route to forgot password page
router.get("/forgot-password", (req: Request, res: Response) => {
  return res.render("forgot_password");
});


//Route to getOTP and send on email page
router.post("/forgot-password", valOtpage, getOTP);


//Route to  resetPassword page here it check if reset token is valid or not then render page with otp expire time
router.get("/reset-password", authForgetPaths, resetPasswordLink);


//Route to Email page along with OTP
router.get("/emailPage", authForgetPaths, (req: Request, res: Response) => {
  const otp = jwt.decode(req.cookies.reset_token) as { otp: string } | null;
  return res.render("email_simulation", { otp: otp?.otp });
});


//route to reset password with otp and new password
router.post("/reset-password", authForgetPaths, resetPassword);


//Route to resend OTP
router.post("/resend-otp", authForgetPaths, resendOTP);

export default router;
