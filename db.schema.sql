Create DATABASE twitter_clone;
drop database twitter_clone;

use twitter_clone;

drop table users;

create table users(
user_id int primary key auto_increment,
first_name varchar(50) not null,
last_name varchar(50) not null,
user_name varchar(50) not null unique,
user_password varchar(200) not null,
email varchar(50) not null unique,
phone varchar(15) not null unique,
bio text,
proifle_pic varchar(255) default "media/avatars/default-avatar.png",
cover_pic varchar(255) default "media/banners/default-banner.png",
location varchar(100) default "Evrywhere",
website varchar(200),
birthdate date,

created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp on update current_timestamp 
);

ALTER TABLE users ALTER COLUMN proifle_pic SET DEFAULT "media/avatars/default-avatar.png";
ALTER TABLE users ALTER COLUMN cover_pic SET DEFAULT "media/banners/default-banner.png";


UPDATE users 
SET proifle_pic = TRIM(LEADING '/' FROM proifle_pic),
    cover_pic = TRIM(LEADING '/' FROM cover_pic)
where user_id > 1;



select * from users;