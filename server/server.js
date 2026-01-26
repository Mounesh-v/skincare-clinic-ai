
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();
const app= express();


//Middleware
app.use(express.json());

connectDB();


app.get('/', (req,res) => {
    res.json({ message:"Heyy server is running"});
})

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`server is running ${process.env.NODE_ENV}`);

})
