import { Router, Request, Response, request, response } from "express";
import { authUser } from "../middleware/auth.middleware";
import { getUserData, updateUserProfile } from "../controllers/user.controller";
import { upload } from "../middleware/fileUpload.middleware";


const router = Router();

router.use(authUser)

router.get("/" , (req:Request , res:Response)=>{
    res.render("home")
})

router.get("/profile" , (req:Request , res:Response) => {
    return getUserData(req, res, "profile");
})

router.get("/profile_edit",(req:Request , res:Response) => {
    return getUserData(req, res, "editProfile");
})

router.post("/editUserProfile",  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]), updateUserProfile
    // (req: Request, res: Response) => {
    //     // Access non-file text fields (firstName, bio, etc.)
    //     console.log("Text Fields:", req.body); 

    //     // Access files (banner, avatar)
    //     // Since we used .fields(), these are inside req.files
    //     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    //     console.log("Banner File:", files?.['banner']?.[0]);
    //     console.log("Avatar File:", files?.['avatar']?.[0]);

    //     res.status(200).json({ message: "Profile updated!" });
    // }
);

export default router;