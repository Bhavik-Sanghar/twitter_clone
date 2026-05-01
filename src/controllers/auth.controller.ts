import { Request, Response } from "express";
import pool from "../configs/db.config";
import { ApiResponse } from "../types";
import bcypt from "bcrypt";
import svgCaptcha from "svg-captcha";
import jwt, { JwtPayload } from "jsonwebtoken";


//Helper function for captcha generation
export const captcha = () => {
  return svgCaptcha.createMathExpr({
    mathMin: 2,
    mathMax: 7,
    mathOperator: "+", // we can also add - 
    noise: 10,
    color: true,
    background: "#cc9966"
  });
};

// For check is email exist or not
const isUserEmailExist = async (req: Request, res: Response) => {
  /**
   * Here we try to find if user email is alrdy in DB if we found then we return false
   */
  const { email } = req.body;
  const query = `SELECT user_id from users WHERE email = ?`;

  try {
    const [data] = await pool.execute(query, [email]);
    const result = data as any[];
    if (result.length == 0) {
      const response: ApiResponse = {
        success: true,
        message: "User not exsist with this email new account can be created",
      };
      return res.status(201).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: "User alredy exsist try again with new email",
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Server side error while cheking existing user email",
    };
    return res.status(500).json(response);
  }
};

// For check is phone exist or not
const isUserPhoneExist = async (req: Request, res: Response) => {
  /**
   * Here we try to find if user Phone is alrdy in DB if we found then we return false
   */
  const { phone } = req.body;
  const query = `SELECT user_id from users WHERE phone = ?`;

  try {
    const [data] = await pool.execute(query, [phone]);
    const result = data as any[];
    if (result.length == 0) {
      const response: ApiResponse = {
        success: true,
        message: "User not exsist with this phone new account can be created",
      };
      return res.status(201).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: "User alredy exsist try again with new phone",
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Server side error while cheking existing user phone",
    };
    return res.status(500).json(response);
  }
};

// For check is user name exist or not
const isUserUserNameExist = async (req: Request, res: Response) => {
  /**
   * Here we try to find if user Phone is alrdy in DB if we found then we return false
   */
  const { user_name } = req.body;
  const query = `SELECT user_id from users WHERE user_name = ?`;

  try {
    const [data] = await pool.execute(query, [user_name]);
    const result = data as any[];
    if (result.length == 0) {
      const response: ApiResponse = {
        success: true,
        message:
          "User not exsist with this user name new account can be created",
      };
      return res.status(201).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: "User alredy exsist try again with new username",
      };
      return res.status(400).json(response);
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Server side error while cheking existing user username",
    };
    return res.status(500).json(response);
  }
};

// Register User
const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone, user_name } = req.body;
  const hashPassword = await bcypt.hash(password, 10);

  const query = `
  INSERT INTO users(first_name , last_name , user_name , email , phone , user_password , time_zone) values (? , ? , ? , ? , ? , ? , ?);
`;

//backend validation for existing email , phone and user name before registration of new user to prevent race condition
  try {
    const [data1] = await pool.execute(
      "SELECT user_id from users WHERE email = ?",
      [email],
    );
    const res1 = data1 as any[];
    if (res1.length !== 0) {
      const response: ApiResponse = {
        success: true,
        message: "User Registration Fail Email Alredy Taken Try Again",
      };
      return res.status(400).json(response);
    }
    const [data2] = await pool.execute(
      "SELECT user_id from users WHERE phone = ?",
      [phone],
    );
    const res2 = data2 as any[];
    if (res2.length !== 0) {
      const response: ApiResponse = {
        success: true,
        message: "User Registration Fail Phone Alredy Taken Try Again",
      };
      return res.status(400).json(response);
    }
    const [data3] = await pool.execute(
      "SELECT user_id from users WHERE user_name = ?",
      [user_name],
    );
    const res3 = data3 as any[];
    if (res3.length !== 0) {
      const response: ApiResponse = {
        success: true,
        message: "User Registration Fail User Name Alredy Taken Try Again",
      };
      return res.status(400).json(response);
    }

    const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await pool.execute(query, [
      firstName,
      lastName,
      user_name,
      email,
      phone,
      hashPassword,
      time_zone
    ]);
    const response: ApiResponse = {
      success: true,
      message: "User Registration Done",
      redirecturl: "/",
    };
    return res.status(201).json(response);
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: true,
      message: "User Registration Failed",
    };
    return res.status(500).json(response);
  }
};


// Login User
const loginUser = async (req: Request, res: Response) => {
  const { identifier, password, remember_me } = req.body;

  try {
    const query = `SELECT user_id , user_name ,user_password from users where email = ? or phone = ? or user_name = ?`;
    const [data] = await pool.execute(query, [
      identifier,
      identifier,
      identifier,
    ]);
    const result = data as any[];
    if (result.length != 0) {
      const hashPassword = result[0].user_password;
      const isMatch: boolean = await bcypt.compare(password, hashPassword);
      if (isMatch) {
        const token = jwt.sign(
          {
            identifier: identifier,
            user_id : result[0].user_id,
            user_name : result[0].user_name
          },
          process.env.JWT_SECRET_KEY as string,
          {
            expiresIn: remember_me ? "7D" : "1h",
          },
        );

        res.cookie("jwt_token", token, {
          maxAge: remember_me ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60,
        });
        const response: ApiResponse = {
          success: true,
          message: "Login Successful!!",
          redirecturl: "/user",
        };
        return res.status(201).json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          message: "Invalid Credentials",
        };
        return res.status(401).json(response);
      }
    } else {
      const response: ApiResponse = {
        success: false,
        message: "Invalid Credentials",
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Login Failed!!",
    };
    return res.status(500).json(response);
  }
};


// For Genrate OTP and send to user for reset password for first step of forgot password
const  getOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const [user] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );
    const result = user as any[];

    if (result.length != 0) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const reset_token = jwt.sign(
        { email: email, otp: otp },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "2m" },
      );

      //cookie for reset password token which include email and otp and expire in 2 min and cookie expire time is 10 min
      res.cookie("reset_token", reset_token, {
        maxAge: 1000 * 60 * 10,
      });

      const response: ApiResponse = {
        success: true,
        message: "User Found Sending OTP!!"
      };
      return res.status(201).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: "User Not Found Try with Differnt Email!!",
      };
      return res.status(404).json(response);
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Serever side error try again in few moment",
    };
    return res.status(500).json(response);
  }
};

// For reset password link genrate and render reset password page with otp expire time 
const resetPasswordLink = (req: Request, res: Response) => {
  const token = req.cookies.reset_token;
  
  if (!token) return res.redirect("/forgot-password");

  const decoded = jwt.decode(token) as { otp: string; exp: number } | null;

  if (!decoded) return res.redirect("/forgot-password");

  return res.render("reset_password", { expiresAt: decoded.exp * 1000 });
};

// For resend OTP when user click on resend OTP button in reset password page
const resendOTP = async (req: Request, res: Response) => {
  const token = req.cookies.reset_token;
  const response: ApiResponse = {
    success: false,
    message: "Session expired Try Again",
    redirecturl: "/forgot-password",
  };
  if (!token) return res.status(401).json(response);

  try {
    const decoded = jwt.decode(token) as {
      email: string;
      otp: string;
    };
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newToken = jwt.sign(
      { email: decoded.email, otp: newOtp },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "2m" },
    );
    res.cookie("reset_token", newToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 10,
    });
    const response: ApiResponse = {
      success: true,
      message: "New OTP is Genrated Go ON new link",
      redirecturl: `/emailPage`,
    };
    res.status(201).json(response);
  } catch (err) {
    const response: ApiResponse = {
      success: false,
      message: "Invalid Session Try Again",
      redirecturl: "/forgot-password",
    };
    res.status(401).json(response);
  }
};

// For reset password with otp and new password
const resetPassword = async (req: Request, res: Response) => {
  const { otp, password } = req.body;
  const decode = jwt.decode(
    req.cookies.reset_token,
  ) as { email: string; otp: string } | null;

  const lastPassword_query = `SELECT user_password from users where email = ?`;

  try {
    const [data] = await pool.query(lastPassword_query, [decode?.email]);
    const lastPassword = (data as any[])[0].user_password;

    const isSame = await bcypt.compare(password, lastPassword);

    if (isSame) {
      const response: ApiResponse = {
        success: false,
        message: "New Password cannot same as last one",
      };
      res.status(400).json(response);
    } else {
      if (otp == decode?.otp) {
        const query = `UPDATE users SET user_password = ? where email = ?`;
        const hashedNewPassword = await bcypt.hash(password, 10);
        await pool.query(query, [hashedNewPassword, decode?.email]);
        const response: ApiResponse = {
          success: true,
          message: "Password Reset Done",
          redirecturl: "/",
        };
        res.clearCookie("reset_token")
        res.status(201).json(response);
      } else {
        const response: ApiResponse = {
          success: true,
          message: "Password Reset Failed Wrong OTP",
          redirecturl: "/",
        };
        res.status(400).json(response);
      }
    }
  } catch (error) {
    console.log(error);
    const response: ApiResponse = {
      success: false,
      message: "Password Reset Failed Server Side Error",
    };
    res.status(500).json(response);
  }
};


// For logout user
const logoutUser = (req : Request , res : Response ) => {
  try {
    const token = req.cookies.jwt_token;
    if(token){
      res.clearCookie("jwt_token");
    const response : ApiResponse = {
      success : false,
      message : "Logout Done!!",
      redirecturl : "/"
    }
    res.status(201).json(response)
    }
    else{
      const response : ApiResponse = {
      success : false,
      message : "No token found Send on Login!!",
      redirecturl : "/"
    }
    res.status(400).json(response)
    }
  } catch (error) {
    const response : ApiResponse = {
      success : false,
      message : "Logout Failed!!",
      redirecturl : "/"
    }
    res.status(500).json(response)
  }
}

export {
  isUserEmailExist,
  isUserPhoneExist,
  isUserUserNameExist,
  registerUser,
  loginUser,
  getOTP,
  resetPassword,
  resendOTP,
  resetPasswordLink,
  logoutUser
};