import { Router, Request, Response, request, response } from "express";
import { authUser } from "../middleware/auth.middleware";
import { changePassword, createComment, deleteComment, deleteTweet, getComments, getEditProfile, getFollowersFollowingList, getProfile, getVerfiy, getVerifybedgePage, homePage, retweetToggle, searchUsers, shareTweetPage, toggelFollow, tweetLikeToggle, tweetPost, updateUserProfile } from "../controllers/user.controller";
import { upload } from "../middleware/fileUpload.middleware";
import { verify } from "jsonwebtoken";
import { verifyCaptcha } from "../middleware/verifyCAPTCHA";


const router = Router();

//middeleware to check if user is authenticated or not
router.use(authUser)

//Home page
router.get("/" ,homePage);

//User Profile
router.get("/profile/:username" ,getProfile)

//Edit Profile
router.get("/profile_edit" , getEditProfile)


//Update User Profile
router.post("/editUserProfile",  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]), updateUserProfile
);


//Create Tweet
router.post("/tweets/create", upload.fields([
  { name: "tweet_img", maxCount: 1 } 
]), tweetPost);


//Follow-Unfollow 
router.post("/follow/:username/:userid/:toggelfollow" , toggelFollow)

//Search Users
router.get("/search/users" , searchUsers)

//like unlike
router.post("/tweets/like_dislike/:tweetId" , tweetLikeToggle)


//Follower and Following List
router.get("/followers/:userId" , getFollowersFollowingList)

//Retweet
router.post("/tweets/retweet/:tweetId" , retweetToggle)

//GetComments
router.post("/tweets/comments/getComments/:tweetId", getComments)

//create Comments
router.post("/tweets/comments/createComment" , createComment)

//chnage Password page
router.get("/change-password" , (req:Request,res:Response) => {
  res.render("change_password")
})  

//Delete Tweet
router.delete("/tweet/:tweetId/delete" , deleteTweet);

//Delete Comment
router.delete("/comment/:commentId/delete" ,deleteComment);


//chnagePassword
router.post("/changePassword" , changePassword)

//shrare tweet
router.get("/share/:username/:tweetId" , shareTweetPage);

//Route to getVerify Email page
router.get("/getVerfied",   getVerifybedgePage);

//Route to Verify Email
router.post("/getVefied" , verifyCaptcha , getVerfiy);

export default router;