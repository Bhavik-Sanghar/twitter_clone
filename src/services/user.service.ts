import pool from "../configs/db.config";
import { RowDataPacket } from "mysql2";

// For get User info with user name
export const fetchUserByUsername = async (username: string) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE user_name = ?",
    [username],
  );
  return data[0] || null;
};

// For get User info with user id
export const fetchUserById = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE user_id = ?",
    [user_id],
  );
  return data[0] || null;
};

// For followercount
export const fetchFollowerCount = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
    [user_id],
  );
  return data[0]?.count;
};

//for following count
export const fetchFollowingCount = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM follows WHERE follower_id = ?",
    [user_id],
  );
  return data[0]?.count;
};

// For fetching tweets and retweet by a user
export const fetchTweetsByUser = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
     ` SELECT 
        t.tweet_id,
        t.user_id AS shared_id, 
        t.content, 
        t.image_url, 
        t.created_at AS created_at, 
        NULL AS retweeter_name,
        u.user_name, u.profile_pic_url, u.first_name, u.last_name,u.email_verified,
        'tweet' AS post_type 
      FROM tweets t 
      JOIN users u ON u.user_id = t.user_id 
      WHERE t.user_id = ? 
      
      UNION ALL
      
      SELECT
        t.tweet_id,
        r.user_id AS shared_id,
        t.content,
        t.image_url,
        r.created_at AS created_at,
        ru.user_name AS retweeter_name, 
        u.user_name, u.profile_pic_url, u.first_name, u.last_name,u.email_verified,
        'retweet' AS post_type 
      FROM retweets r 
      JOIN tweets t ON t.tweet_id = r.original_tweet_id 
      JOIN users u ON u.user_id = t.user_id 
      JOIN users ru ON r.user_id = ru.user_id
      WHERE r.user_id = ? 
      ORDER BY created_at DESC`,
    [user_id, user_id],
  );
  return data;
};

// for tweet count
export const fetchTweetCount = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM tweets WHERE user_id = ?",
    [user_id],
  );
  return data[0]?.count;
};

//for checking is user follow already or not
export const checkIsFollowing = async (
  follower_id: number,
  following_id: number,
) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    "SELECT follow_id FROM follows WHERE follower_id = ? AND following_id = ?",
    [follower_id, following_id],
  );
  return data.length > 0;
};

// for geting likes of tweets
export const fetchLikesByTweetIds = async (tweetIds: number[]) => {
  if (tweetIds.length === 0) return {};

  const placeholders = tweetIds.map(() => "?").join(",");

  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT tweet_id, COUNT(*) as like_count FROM likes WHERE tweet_id IN (${placeholders}) GROUP BY tweet_id`,
    tweetIds,
  );
  const likeMap: Record<number, number> = {};
  data.forEach((row) => {
    likeMap[row.tweet_id] = row.like_count;
  });
  return likeMap;
};

//for isLiked by user
export const featchIslikedByUser = async (
  user_id: number,
  tweetIds: number[],
) => {
  if (tweetIds.length === 0) return {};

  const placeholders = tweetIds.map(() => "?").join(",");

  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT tweet_id FROM likes WHERE user_id = ? AND tweet_id IN (${placeholders})`,
    [user_id, ...tweetIds],
  );
  const likedMap: Record<number, boolean> = {};
  data.forEach((row) => {
    likedMap[row.tweet_id] = true;
  });
  return likedMap;
};

// For home feed, we need to fetch tweets from users that the current user is following, incluing their own tweets.
// export const homeFeed = async (user_id: number) => {
//   const [data] = await pool.execute<RowDataPacket[]>(
//     `SELECT t.*, u.user_name, u.profile_pic_url , u.first_name , u.last_name
//      FROM tweets t
//      JOIN users u ON t.user_id = u.user_id
//      WHERE t.user_id IN (
//        SELECT following_id FROM follows WHERE follower_id = ? UNION SELECT ?
//      )
//      ORDER BY t.created_at DESC`,
//     [user_id, user_id],
//   );
//   return data;
// };

// Updated home feed to include retweets and also shared_id for retweets and tweets both and also post type to differntiate between them
export const homeFeed = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `
    SELECT t.tweet_id, 
        t.user_id AS user_id, 
        t.user_id AS shared_id,
        t.content, 
        t.image_url, 
        t.created_at AS created_at, 
        'tweet' AS post_type,
        u.user_name, u.profile_pic_url, u.first_name, u.last_name,u.email_verified,
        NULL AS retweeter_name FROM tweets t JOIN users u ON u.user_id = t.user_id 
        WHERE t.user_id IN ( SELECT following_id FROM follows WHERE follower_id = ? UNION SELECT ? )

        UNION ALL

    SELECT t.tweet_id,
        t.user_id AS user_id, 
        r.user_id AS shared_id,
        t.content, 
        t.image_url, 
        r.created_at AS created_at, 
        'retweet' AS post_type,
        u.user_name, u.profile_pic_url, u.first_name, u.last_name,u.email_verified,
        ru.user_name AS retweeter_name 
        FROM retweets r
        JOIN tweets t ON t.tweet_id = r.original_tweet_id
        JOIN users u ON t.user_id = u.user_id
        JOIN users ru ON r.user_id = ru.user_id
        WHERE r.user_id IN ( SELECT following_id FROM follows WHERE follower_id = ? UNION SELECT ?  )

        ORDER  BY created_at DESC 
    `,
    [user_id, user_id, user_id, user_id],
  );
  return data;
};

// For suggested users
export const suggestions = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT user_id, user_name, profile_pic_url, first_name, last_name
     FROM users
     WHERE user_id != ? AND user_id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
     ORDER BY RAND()
     LIMIT 5`,
    [user_id, user_id],
  );
  return data;
};

//For Follower list
export const fetchFollowerList = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      follower_id, 
      user_name, 
      profile_pic_url, 
      first_name, 
      last_name
    FROM follows f
    JOIN users u ON f.follower_id = u.user_id
    WHERE f.following_id = ?`,
  [user_id],
  );
  return data;
};

//For Following list
export const fetchFollowingList = async (user_id: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT following_id, user_name, profile_pic_url, first_name, last_name
     FROM follows f
     JOIN users u ON f.following_id = u.user_id
     WHERE f.follower_id = ?`,
    [user_id],
  );
  return data;
};

//For retweet count of tweet
export const fetchRetweetByTweetsId = async (tweetIds: number[]) => {
  if (tweetIds.length === 0) return {};

  const placeholders = tweetIds.map(() => "?").join(",");

  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT original_tweet_id, COUNT(*) as retweet_count FROM retweets WHERE original_tweet_id IN (${placeholders}) GROUP BY original_tweet_id`,
    tweetIds,
  );
  const retweetMap: Record<number, number> = {};
  data.forEach((row) => {
    retweetMap[row.original_tweet_id] = row.retweet_count;
  });
  return retweetMap;
};

//for isRetweeted by user
export const featchIsretweetedByUser = async (
  user_id: number,
  tweetIds: number[],
) => {
  if (tweetIds.length === 0) return {};

  const placeholders = tweetIds.map(() => "?").join(",");

  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT original_tweet_id FROM retweets WHERE user_id = ? AND original_tweet_id IN (${placeholders})`,
    [user_id, ...tweetIds],
  );
  const retweetMap: Record<number, boolean> = {};
  data.forEach((row) => {
    retweetMap[row.original_tweet_id] = true;
  });
  return retweetMap;
};

//fetch comment count by tweet id
export const fetchCommentsCountByTweetIds = async (tweetIds: number[]) => {
  if (tweetIds.length === 0) return {};

  const placeholders = tweetIds.map(() => "?").join(",");

  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT tweet_id, COUNT(*) as comment_count FROM comments WHERE tweet_id IN (${placeholders}) GROUP BY tweet_id`,
    tweetIds,
  );

  const commentMap: Record<number, number> = {};
  data.forEach((row) => {
    commentMap[row.tweet_id] = row.comment_count;
  });
  return commentMap;
};

//fetch commets by tweetid
export const fetchCommentsByTweetId = async (tweetID: number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT c.comment_id , c.content , u.user_name , u.profile_pic_url , c.parent_id  , c.created_at from comments c JOIN users u ON u.user_id = c.user_id where tweet_id = ? ORDER BY c.created_at DESC`,
    [tweetID],
  );
  return data;
};


//To check is user email is verifed or not 
export const fetchverficationStatus = async(user_id : number) => {
  const [data] = await pool.execute<RowDataPacket[]>(
    `SELECT email_verified from users WHERE user_id = ? AND email_verified = 1`
   , [user_id]);

  return (data.length > 0);
}
