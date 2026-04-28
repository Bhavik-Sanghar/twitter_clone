import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "../configs/db.config";
import { RowDataPacket } from "mysql2";
import { ApiResponse } from "../types";
import fs from "fs";

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
} from "../services/user.service";

export const homePage = async (req: Request, res: Response) => {
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;
  const user = await fetchUserById(user_id);
  const feed = await homeFeed(user_id);
  const suggestedUsers = await suggestions(user_id);

  //Tweet like
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

  //Tweet Retweet
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

  //Tweet Comments
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

  const [followers_count, following_count, tweet_count, tweets, isFollowing] =
    await Promise.all([
      fetchFollowerCount(profileUser.user_id),
      fetchFollowingCount(profileUser.user_id),
      fetchTweetCount(profileUser.user_id),
      fetchTweetsByUser(profileUser.user_id),
      isOwnProfile
        ? Promise.resolve(false)
        : checkIsFollowing(currentUserId, profileUser.user_id),
    ]);

  //Tweeet Like
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

  //Tweet Retweet
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

  const isVerified = true;

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

export const getEditProfile = async (req: Request, res: Response) => {
  const currentUserId = (jwt.decode(req.cookies.jwt_token) as JwtPayload)
    .user_id;
  const user = await fetchUserById(currentUserId);
  if (!user) return res.status(404).send("User not found");
  res.render("profile_edit", { user });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { first_name, last_name, bio, location, website, dob } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const token = jwt.decode(req.cookies.jwt_token) as JwtPayload;
  const { user_id, user_name } = token;

  //delete old pics with fs.unlink if new pics uploaded to avoid unused files in media folder
  if (files?.["avatar"]?.[0]?.path) {
    const user = await fetchUserById(user_id);
    if (user?.profile_pic_url) {
      try {
        await fs.promises.unlink(user.profile_pic_url);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }
  }

  if (files?.["banner"]?.[0]?.path) {
    const user = await fetchUserById(user_id);
    if (user?.cover_pic_url) {
      try {
        await fs.promises.unlink(user.cover_pic_url);
      } catch (error) {
        console.error("Error deleting old banner:", error);
      }
    }
  }

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

  const fieldsToUpdate = Object.keys(updates).filter(
    (key) => updates[key] !== undefined,
  );

  if (fieldsToUpdate.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
  const values = fieldsToUpdate.map((field) => updates[field]);

  values.push(user_id);

  const finalQuery = `UPDATE users SET ${setClause} WHERE user_id = ?;`;

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
    const [data] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM likes WHERE user_id = ? AND tweet_id = ?",
      [user_id, tweet_id],
    );

    if ((data as any).length > 0) {
      await pool.execute(
        "DELETE FROM likes WHERE user_id = ? AND tweet_id = ?",
        [user_id, tweet_id],
      );
      res.status(201).json({ success: true, message: "Tweet unliked" });
    } else {
      await pool.execute(
        "INSERT INTO likes (user_id, tweet_id) VALUES (?, ?)",
        [user_id, tweet_id],
      );
      res.status(201).json({ success: true, message: "Tweet liked" });
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
}

//Create Comment
export const createComment = async (req: Request, res: Response) => {
  const { comment_content, tweetId } = req.body;
  
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  try {
    const query = "INSERT INTO comments (user_id, tweet_id, content) VALUES (?, ?, ?)";

    await pool.execute(query, [user_id, tweetId, comment_content]);

    res.status(201).json({message : "Comment Added successfully!!"});
  } catch (error) {
    console.log("Error while insert comment" , error);
    res.status(500).json({message : "Error while adding comment"})
  }
};
