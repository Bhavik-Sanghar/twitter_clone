import { Request, Response } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import pool from "../configs/db.config";
import { RowDataPacket } from "mysql2";
import bcypt from "bcrypt";
import session from "express-session";

import {
  fetchUserByUsername,
  fetchFollowerCount,
  fetchFollowingCount,
  fetchTweetsByUser,
  fetchTweetCount,
  checkIsFollowing,
  fetchUserById,
  homeFeed,
  suggestions,
  fetchLikesByTweetIds,
  featchIslikedByUser,
  fetchFollowerList,
  fetchFollowingList,
  fetchRetweetByTweetsId,
  featchIsretweetedByUser,
  fetchCommentsCountByTweetIds,
  fetchCommentsByTweetId,
  fetchverficationStatus,
} from "../services/user.service";

// For home page feed rendering with tweets and retweets both and also suggested users
export const homePage = async (req: Request, res: Response) => {
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;
  //fetch user info for navbar and also for suggestions and feed
  const user = await fetchUserById(user_id);
  //fetch home feed data with tweets and retweets both and also shared_id for retweets and tweets both and also post type to differntiate between them
  const feed = await homeFeed(user_id);
  //fetch suggested users for current user
  const suggestedUsers = await suggestions(user_id);

  //Tweet Like Map to check how many likes for each tweet in feed and also isLiked by current user or not
  const likesMap = await fetchLikesByTweetIds(
    feed.map((tweet) => tweet.tweet_id),
  );

  feed.forEach((tweet) => {
    (tweet as any).likes_count = likesMap[tweet.tweet_id] || 0;
  });

  const islikesMap = await featchIslikedByUser(
    user_id,
    feed.map((tweet) => tweet.tweet_id),
  );

  feed.forEach((tweet) => {
    (tweet as any).isLiked = islikesMap[tweet.tweet_id] || false;
  });

  //Tweet Retweet Map to check how many retweets for each tweet in feed and also isRetweeted by current user or not
  const retweetMap = await fetchRetweetByTweetsId(
    feed.map((tweet) => tweet.tweet_id),
  );

  feed.forEach((tweet) => {
    (tweet as any).retweet_count = retweetMap[tweet.tweet_id] || 0;
  });

  const isRetweetedMap = await featchIsretweetedByUser(
    user_id,
    feed.map((tweet) => tweet.tweet_id),
  );

  feed.forEach((tweet) => {
    (tweet as any).isRetweeted = isRetweetedMap[tweet.tweet_id] || false;
  });

  //Tweet Comments Count Map to check how many comments for each tweet in feed
  const commentMap = await fetchCommentsCountByTweetIds(
    feed.map((tweet) => tweet.tweet_id),
  );
  feed.forEach(
    (tweet) => ((tweet as any).comment_count = commentMap[tweet.tweet_id] || 0),
  );

  res.render("home", {
    user: user,
    feed: feed,
    suggestedUsers: suggestedUsers,
  });
};

// For profile
export const getProfile = async (req: Request, res: Response) => {
  const currentUserId = (jwt.decode(req.cookies.jwt_token) as JwtPayload)
    .user_id;

  const rawUsername = req.params.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  if (!username) return res.status(400).send("Username is required");

  const profileUser = await fetchUserByUsername(username);

  if (!profileUser) return res.status(404).send("User not found");

  //Check own profile
  const isOwnProfile = currentUserId === profileUser.user_id;

  //fetching followers count, following count, tweets count, tweets and also check isFollowing for current user
  const [followers_count, following_count, tweet_count, tweets, isFollowing , isVerified] =
    await Promise.all([
      fetchFollowerCount(profileUser.user_id),
      fetchFollowingCount(profileUser.user_id),
      fetchTweetCount(profileUser.user_id),
      fetchTweetsByUser(profileUser.user_id),
      isOwnProfile
        ? Promise.resolve(false)
        : checkIsFollowing(currentUserId, profileUser.user_id),
        fetchverficationStatus(profileUser.user_id)
    ]);

  //Tweeet Like and isLiked by current user
  const likesMap = await fetchLikesByTweetIds(
    (await fetchTweetsByUser(profileUser.user_id)).map(
      (tweet) => tweet.tweet_id,
    ),
  );

  const islikesMap = await featchIslikedByUser(
    currentUserId,
    (await fetchTweetsByUser(profileUser.user_id)).map(
      (tweet) => tweet.tweet_id,
    ),
  );

  tweets.forEach((tweet) => {
    (tweet as any).likes_count = likesMap[tweet.tweet_id] || 0;
  });

  tweets.forEach((tweet) => {
    (tweet as any).isLiked = islikesMap[tweet.tweet_id] || false;
  });

  //Tweet Retweet and isRetweeted by current user
  const retweetMap = await fetchRetweetByTweetsId(
    tweets.map((tweet) => tweet.tweet_id),
  );

  tweets.forEach((tweet) => {
    (tweet as any).retweet_count = retweetMap[tweet.tweet_id] || 0;
  });

  const isRetweetedMap = await featchIsretweetedByUser(
    currentUserId,
    tweets.map((tweet) => tweet.tweet_id),
  );

  tweets.forEach((tweet) => {
    (tweet as any).isRetweeted = isRetweetedMap[tweet.tweet_id] || false;
  });

  //Tweet Comments
  const commentMap = await fetchCommentsCountByTweetIds(
    tweets.map((tweet) => tweet.tweet_id),
  );
  tweets.forEach(
    (tweet) => ((tweet as any).comment_count = commentMap[tweet.tweet_id] || 0),
  );



  res.render("profile", {
    user: profileUser,
    isOwnProfile,
    isVerified,
    isFollowing,
    followers_count,
    following_count,
    tweet_count,
    tweets,
  });
};

// For render edit profile page with current user data
export const getEditProfile = async (req: Request, res: Response) => {
  const currentUserId = (jwt.decode(req.cookies.jwt_token) as JwtPayload)
    .user_id;
  const user = await fetchUserById(currentUserId);
  if (!user) return res.status(404).send("User not found");
  res.render("profile_edit", { user });
};

//For Verification Page
export const getVerifybedgePage = async (req: Request, res: Response) => {
  const verfication_otp = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  req.session.verfication_otp = {
    otp: verfication_otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  res.render("verify_email", { otp: verfication_otp });
};

export const getVerfiy = async (req: Request, res: Response) => {
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;
  const user_name = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_name;
  const { otp, password } = req.body;
  const stored_otp = req.session.verfication_otp?.otp;
  try {
    if (!stored_otp) {
      return res.status(500).json({ message: "OTP is Expire try again" });
    }

    if (otp !== stored_otp) {
      return res.status(400).json({ message: "OTP is WRONG try again" });
    }
    const [data] = await pool.execute<RowDataPacket[]>(
      `SELECT user_password from users WHERE user_id = ?`,
      [user_id],
    );
    const stored_password = data[0]!.user_password;
    const isMatch = await bcypt.compare(password, stored_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current Password is Wrong" });
    } else {
      const query = `UPDATE users SET email_verified = 1 where user_id = ?`;
      await pool.execute(query, [user_id]);
      return res.status(201).json({
        message: "You are Verfied Hurray...",
        redirecturl: `/user/profile/${user_name}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong try again" });
  }
};

// For Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  const { first_name, last_name, bio, location, website, dob } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const token = jwt.decode(req.cookies.jwt_token) as JwtPayload;
  const { user_id, user_name } = token;

  const updates: Record<string, any> = {
    first_name,
    last_name,
    bio,
    location,
    website,
    birthdate: dob,
    profile_pic_url: files?.["avatar"]?.[0]?.path,
    cover_pic_url: files?.["banner"]?.[0]?.path,
  };

  // Remove undefined fields from updates
  const updateThings = Object.keys(updates).filter(
    (key) => updates[key] !== undefined,
  );

  if (updateThings.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  const placeHolder = updateThings.map((field) => `${field} = ?`).join(", ");
  const values = updateThings.map((field) => updates[field]);

  values.push(user_id);

  const finalQuery = `UPDATE users SET ${placeHolder} WHERE user_id = ?;`;

  try {
    await pool.execute(finalQuery, values);

    res.status(201).json({
      success: true,
      message: "Profile updated successfully",
      redirecturl: `/user/profile/${user_name}`,
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    res.status(500).json({ success: false, message: "User Update Failed" });
  }
};

// For create new tweet by user
export const tweetPost = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const { tweet_content } = req.body;

  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  const tweetImagePath = files?.["tweet_img"]?.[0]?.path || null;

  if (!tweet_content && !tweetImagePath) {
    return res.status(400).json({
      success: false,
      message: "Tweet cannot be empty. Add some text or an image!",
    });
  }

  const query = `INSERT INTO tweets(user_id, content, image_url) VALUES (?, ?, ?)`;

  try {
    await pool.execute(query, [user_id, tweet_content || null, tweetImagePath]);

    return res.status(201).json({
      success: true,
      message: "Tweet post successful!",
    });
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({
      success: false,
      message: "Tweet post failed due to server error",
    });
  }
};

// For follow and unfollow user
export const toggelFollow = async (req: Request, res: Response) => {
  const user_id = req.params.userid;
  const user_name = req.params.username;
  const toggel = req.params.toggelfollow;
  const currentUserId = (jwt.decode(req.cookies.jwt_token) as JwtPayload)
    .user_id;

  const query =
    toggel === "follow"
      ? "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)"
      : "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";

  try {
    await pool.execute(query, [currentUserId, user_id]);
    res.redirect(`/user/profile/${user_name}`);
  } catch (error) {
    console.error("Follow/Unfollow Error:", error);
    res
      .status(500)
      .send("An error occurred while trying to follow/unfollow the user.");
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query parameter 'q' is required" });
  }

  try {
    const data = await pool.execute<RowDataPacket[]>(
      "SELECT user_id, first_name , last_name, user_name, profile_pic_url FROM users WHERE user_name LIKE ? LIMIT 5",
      [`%${query}%`],
    );
    res.json(data[0]);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while searching for users",
    });
  }
};

export const tweetLikeToggle = async (req: Request, res: Response) => {
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;
  const tweet_id = req.params.tweetId;

  try {
    const [del]: any = await pool.execute(
      "DELETE FROM likes WHERE user_id = ? AND tweet_id = ?",
      [user_id, tweet_id],
    );

    if (del.affectedRows > 0) {
      return res.json({ message: "Tweet unliked" });
    }

    try {
      await pool.execute(
        "INSERT INTO likes (user_id, tweet_id) VALUES (?, ?)",
        [user_id, tweet_id],
      );
      res.json({ message: "Tweet liked" });
    } catch (err: any) {
      res.json({ message: "Tweet liked" });
    }
  } catch (error) {
    console.error("Like Toggle Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while toggling like",
    });
  }
};

export const getFollowersFollowingList = async (
  req: Request,
  res: Response,
) => {
  const rawUserId = req.params.userId;
  const userIdStr = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  if (!userIdStr) {
    return res.status(400).json({ message: "userId param is required" });
  }

  const user_id = parseInt(userIdStr, 10);
  if (Number.isNaN(user_id)) {
    return res.status(400).json({ message: "Invalid userId parameter" });
  }

  try {
    const followers = await fetchFollowerList(user_id);
    const following = await fetchFollowingList(user_id);
    const user = await fetchUserById(user_id);
    res.status(200).render("user_followers", { followers, following, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while fetching users followers" });
  }
};

export const retweetToggle = async (req: Request, res: Response) => {
  const tweet_id = req.params.tweetId;
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  try {
    const [data] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM retweets WHERE user_id = ? AND original_tweet_id = ?",
      [user_id, tweet_id],
    );

    if ((data as any).length > 0) {
      await pool.execute(
        "DELETE FROM retweets WHERE user_id = ? AND original_tweet_id = ?",
        [user_id, tweet_id],
      );
      res.status(201).json({ success: true, message: "Retweet Removed!!" });
    } else {
      await pool.execute(
        "INSERT INTO retweets (user_id, original_tweet_id) VALUES (?, ?)",
        [user_id, tweet_id],
      );
      res.status(201).json({ success: true, message: "Tweet Retweeted!!" });
    }
  } catch (error) {
    console.error("Retweet Toggle Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while toggling retweet",
    });
  }
};

//Fetch Commets
export const getComments = async (req: Request, res: Response) => {
  const rawTweetId = req.params.tweetId;
  const tweetId = Array.isArray(rawTweetId) ? rawTweetId[0] : rawTweetId;
  if (!tweetId) {
    return res.status(400).json({ message: "tweetID param is required" });
  }

  const tweet_id = parseInt(tweetId, 10);
  if (Number.isNaN(tweet_id)) {
    return res.status(400).json({ message: "Invalid tweetID parameter" });
  }

  try {
    const tweet_comments = await fetchCommentsByTweetId(tweet_id);
    return res.status(200).json(tweet_comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Error while fetching comments" });
  }
};

//Create Comment
export const createComment = async (req: Request, res: Response) => {
  const { comment_content, tweetId } = req.body;

  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  try {
    const query =
      "INSERT INTO comments (user_id, tweet_id, content) VALUES (?, ?, ?)";

    await pool.execute(query, [user_id, tweetId, comment_content]);

    res.status(201).json({ message: "Comment Added successfully!!" });
  } catch (error) {
    console.log("Error while insert comment", error);
    res.status(500).json({ message: "Error while adding comment" });
  }
};

//delete Tweet
export const deleteTweet = async (req: Request, res: Response) => {
  const rawTweetId = req.params.tweetId;
  const tweetId = Array.isArray(rawTweetId) ? rawTweetId[0] : rawTweetId;
  if (!tweetId) {
    return res.status(400).json({ message: "tweetID param is required" });
  }

  const tweet_id = parseInt(tweetId, 10);
  if (Number.isNaN(tweet_id)) {
    return res.status(400).json({ message: "Invalid tweetID parameter" });
  }

  try {
    await pool.execute("DELETE FROM tweets WHERE tweet_id = ?", [tweet_id]);
    res.status(201).json({ message: "Tweet deleted successfully" });
  } catch (error) {
    console.error("Error deleting tweet:", error);
    res.status(500).json({ message: "Error while deleting the tweet" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;
  const { cuurent_password, new_password } = req.body;

  try {
    const query = `SELECT user_password from users where user_id = ?`;
    const [data] = await pool.execute<RowDataPacket[]>(query, [user_id]);
    const isMatch = await bcypt.compare(
      cuurent_password,
      data[0]!.user_password,
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is not valid try again !!" });
    } else {
      const hashedNewPassword = await bcypt.hash(new_password, 10);
      const query = `UPDATE users SET user_password = ? where user_id = ?`;
      await pool.execute(query, [hashedNewPassword, user_id]);
      res.clearCookie("jwt_token");
      res.status(201).json({
        message: "Password changed successful!!",
        redirecturl: "/",
      });
    }
  } catch (error) {
    console.log("Server side error while change password", error);
    res.status(500).json({
      message: "Error While Changeing Password",
    });
  }
};

//shared tweet page
export const shareTweetPage = async (req: Request, res: Response) => {
  const rawUsername = req.params.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const rawTweetId = req.params.tweetId;
  const tweetId = Array.isArray(rawTweetId) ? rawTweetId[0] : rawTweetId;

  if (!username || !tweetId) {
    return res.status(400).send("Invalid URL parameters");
  }

  try {
    const [data] = await pool.execute<RowDataPacket[]>(
      "SELECT t.*, u.user_name , u.profile_pic_url FROM tweets t JOIN users u ON t.user_id = u.user_id WHERE t.tweet_id = ? AND u.user_name = ?",
      [tweetId, username],
    );

    if ((data as any).length === 0) {
      return res.status(404).send("Tweet not found");
    }

    const tweet = (data as any)[0];
    res.render("share_tweet", { tweet });
  } catch (error) {
    console.error("Error fetching tweet for sharing:", error);
    res.status(500).send("An error occurred while fetching the tweet");
  }
};

//delete Comment
export const deleteComment = async (req: Request, res: Response) => {
  const rawCommentId = req.params.commentId;
  const commentId = Array.isArray(rawCommentId)
    ? rawCommentId[0]
    : rawCommentId;
  if (!commentId) {
    return res.status(400).json({ message: "commentID param is required" });
  }

  const comment_id = parseInt(commentId, 10);
  if (Number.isNaN(comment_id)) {
    return res.status(400).json({ message: "Invalid commentID parameter" });
  }

  try {
    await pool.execute("DELETE FROM comments WHERE comment_id = ?", [
      comment_id,
    ]);
    res.status(201).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error while deleting the comment" });
  }
};
