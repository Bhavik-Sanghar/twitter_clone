import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"


export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.jwt_token;
    if (!token) {
      return res.redirect("/");
    } else {
      const decode = jwt.verify(token , process.env.JWT_SECRET_KEY!);
      (req as any).user = decode; 
      next();
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
};
