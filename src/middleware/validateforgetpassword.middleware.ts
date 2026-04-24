import { Request, Response, NextFunction } from "express";

export const authForgetPaths = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.reset_token;
    if (!token) {
      return res.redirect("/forgot-password");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/forgot-password");
  }
};

export const valOtpage = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (email) {
      next();
    } else {
      return res.redirect("/forgot-password");
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/forgot-password");
  }
};
