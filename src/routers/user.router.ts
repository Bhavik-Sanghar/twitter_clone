import { Router, Request, Response, request, response } from "express";
import { authUser } from "../middleware/auth.middleware";
import { changePassword, createComment, deleteTweet, getComments, getEditProfile, getFollowersFollowingList, getProfile, homePage, retweetToggle, searchUsers, shareTweetPage, toggelFollow, tweetLikeToggle, tweetPost, updateUserProfile } from "../controllers/user.controller";
import {  upload } from "../middleware/fileUpload.middleware";
import multer from "multer";

const router = Router();


//shrare tweet
router.get("/share/:username/:tweetId" , shareTweetPage);



router.use(authUser)

router.get("/" ,homePage);

router.get("/profile/:username" ,getProfile)

router.get("/profile_edit" , getEditProfile)

router.post("/editUserProfile",  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]), updateUserProfile
);

router.post("/tweets/create", upload.fields([
  { name: "tweet_img", maxCount: 1 } 
]),  tweetPost);


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


//chnagePassword
router.post("/changePassword" , changePassword)

router.use((err: any, req: any, res: any, next: any) => {
   if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: "File is too large! Maximum limit is 5MB."  
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal Server Error" });
});



export default router;