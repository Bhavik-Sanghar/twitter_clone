import { Router, Request, Response } from "express";
import { getOTP, isUserEmailExist, isUserPhoneExist, isUserUserNameExist, loginUser, registerUser, resetPassword , resendOTP, resetPasswordLink, logoutUser} from "../controllers/auth.controller";
import { authForgetPaths, valOtpage } from "../middleware/validateforgetpassword.middleware";
import jwt from 'jsonwebtoken' 


const router = Router();

router.post("/checkEmail",isUserEmailExist)
router.post("/checkPhone",isUserPhoneExist)
router.post("/checkUserName",isUserUserNameExist)

router.get("/" , (req:Request , res:Response)=>{
   if(req.cookies.jwt_token){
    return res.redirect("/user")
   }
   return res.render("login")
})

router.get("/signup" , (req:Request , res:Response)=>{
    return res.render("signup")
})

router.post("/signup" , registerUser)

router.post("/login" , loginUser)

router.get("/logout" , logoutUser)

router.get("/forgot-password"  ,(req:Request , res:Response)=>{
    return res.render("forgot_password")
})

router.post("/forgot-password" , valOtpage ,getOTP)

router.get("/reset-password",authForgetPaths ,resetPasswordLink);


router.get("/emailPage" , authForgetPaths , (req:Request , res:Response) => {
    const otp = jwt.decode(req.cookies.reset_token) as {otp:string} | null
    return res.render("email_simulation" , {otp : otp?.otp})
})


router.post("/reset-password" , authForgetPaths , resetPassword)

router.post("/resend-otp" , authForgetPaths , resendOTP)


export default router;``