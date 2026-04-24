import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "../configs/db.config";
import { RowDataPacket } from "mysql2";
import { ApiResponse } from "../types";

const getUserData = async (req: Request, res: Response, flag = "") => {
    const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  const query = `
  SELECT * from users where user_id = ?
  `;

  try {
    const [data] = await pool.execute<RowDataPacket[]>(query, [
     user_id
    ]);

    if (!data || data.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = data[0];
    if (flag == "profile") {
      res.render("profile", { user: data[0] });
    } else if (flag == "editProfile") {
      res.render("profile_edit", { user: data[0] });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  const { first_name, last_name, bio, location, website, dob } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const user_id = (jwt.decode(req.cookies.jwt_token) as JwtPayload).user_id;

  const bannerPath = files?.["banner"]?.[0]?.path;
  const avatarPath = files?.["avatar"]?.[0]?.path;

  const query = `
  UPDATE users 
  SET first_name = ?,
  last_name = ?,
  bio = ?,
  proifle_pic = ?, 
  cover_pic = ?,
  location = ?,
  website = ?,
  birthdate = ?
  WHERE user_id = ?;
  `;

  try {
    await pool.execute(query, [
      first_name,
      last_name,
      bio,
      avatarPath,
      bannerPath,
      location,
      website,
      dob,
      user_id
    ]);
    const response: ApiResponse = {
      success: true,
      message: "User Update Done",
      redirecturl: "/user/profile",
    };
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "User Update Failed",
    };
    res.status(500).json(response);
  }
};

export { getUserData, updateUserProfile };
