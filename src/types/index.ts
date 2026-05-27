export interface ApiResponse {
    success : boolean,
    message : string,
    data ?: object,
    errors ?: string,
    redirecturl ?: string,
    otp ?: string
}


declare module "express-session" {
  interface SessionData {
    captcha: {
      text?: string;
      expiresAt?: number;
    },
    verfication_otp : {
      otp ?: string,
      expiresAt?:number
    }
  }
}
