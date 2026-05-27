-- //Users TABLE to manage all user-related information, including authentication details, profile information, and account status.

CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  user_name VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  user_password VARCHAR(255) NOT NULL,

  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  bio VARCHAR(280),
  profile_pic_url VARCHAR(500) DEFAULT 'media/avatars/default-avatar.png',
  cover_pic_url VARCHAR(500) DEFAULT 'media/banners/default-banner.png',
  
  website VARCHAR(255),
  location VARCHAR(120),
  birthdate DATE,
  time_zone VARCHAR(64) NOT NULL,

  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  account_status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- // Follow TABLE to manage the follower-following relationships between users.
CREATE TABLE follows (
  follow_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_follow (follower_id, following_id),
  
  FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tweets (
  tweet_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  content      VARCHAR(256),
  image_url    VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),          -- for fetching user's tweets fast
  INDEX idx_created_at (created_at)     -- for feed sorting by latest
);


CREATE TABLE likes (
  like_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  tweet_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_like (user_id, tweet_id),  -- prevents double like at DB level
  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE,
  INDEX idx_tweet_id (tweet_id)
);

CREATE TABLE comments (
  comment_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  tweet_id    INT NOT NULL,
  parent_id   INT DEFAULT NULL,   
  content     VARCHAR(256) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE CASCADE,
  FOREIGN KEY (tweet_id)   REFERENCES tweets(tweet_id)  ON DELETE CASCADE,
  FOREIGN KEY (parent_id)  REFERENCES comments(comment_id) ON DELETE CASCADE,
  INDEX idx_tweet_id  (tweet_id),
  INDEX idx_parent_id (parent_id)
);

CREATE TABLE retweets (
  retweet_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT NOT NULL,
  original_tweet_id INT NOT NULL,   
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_retweet (user_id, original_tweet_id),  -- one retweet per tweet
  FOREIGN KEY (user_id)           REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (original_tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE,
  INDEX idx_original_tweet (original_tweet_id)
);
