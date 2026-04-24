export interface ApiResponse {
    success : boolean,
    message : string,
    data ?: object,
    errors ?: string,
    redirecturl ?: string,
    otp ?: string
}
