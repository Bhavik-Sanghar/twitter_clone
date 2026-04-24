import "dotenv/config"
import app from "./app";
import pool from "./configs/db.config";




const testConnection = async () => {
    try {
        await pool.getConnection();
        console.log("DB Connection Successful!!");
        pool.releaseConnection
    } catch (error) {
        console.log(error);
        console.log("Error While Connection to DB");
    }
}

testConnection();

app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`Server is live at http://localhost:${process.env.PORT}`);
})