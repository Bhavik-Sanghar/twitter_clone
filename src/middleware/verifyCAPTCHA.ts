import { Request, Response, NextFunction } from "express";

export const verifyCaptcha = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { captcha_inp } = req.body;

  const storedCaptcha = req.session.captcha;

  // Check if the CAPTCHA exists, if it matches the user input, and if it has not expired
  if (!storedCaptcha) {
    res.status(400).json({ message: "CAPTCHA EXPIRED" });
  } else if (storedCaptcha.text !== captcha_inp) {
    res.status(400).json({ message: "Invalid CAPTCHA" });
  }
  // If the CAPTCHA is valid, proceed to the next middleware or route handler
  else if (storedCaptcha.text == captcha_inp) {
    next();
  }
};
