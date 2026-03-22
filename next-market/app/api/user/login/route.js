import { NextResponse } from "next/server";
import {SignJWT, jwtVerify} from "jose";
import connectDB from "../../../utils/database";
import { UserModel } from "../../../utils/schemaModels";

export async function POST(request) {
    const reqBody = await request.json();
    try{
        await connectDB();
        const savedUserData = await UserModel.findOne({email: reqBody.email});
        if(savedUserData) {
            if(savedUserData.password === reqBody.password) {
                // Create JWT token
                const secretKey = new TextEncoder().encode("next-market-app-book");
                const payload = {
                    email: reqBody.email,};
                const token = await new SignJWT(payload)
                    .setProtectedHeader({ alg: "HS256" })
                    .setExpirationTime("2h")
                    .sign(secretKey);
                console.log("Generated JWT token:", token);
                return NextResponse.json({message: 'User logged in successfully!'});
            } else {
                return NextResponse.json({message: 'Invalid email or password.'}, {status: 401});
            }   
        } else {
            return NextResponse.json({message: 'Invalid email or password.'}, {status: 401});
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        return NextResponse.json({message: 'Failed to log in user.'}, {status: 500});       
    }
}   