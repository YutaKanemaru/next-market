import { NextResponse } from "next/server";
import connectDB from "../../../utils/database";
import { UserModel } from "../../../utils/schemaModels";

export async function POST(request) {
    const reqBody = await request.json();
    try{
        await connectDB();
        await UserModel.create(reqBody);
        return NextResponse.json({message: 'User created successfully!'});
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({message: 'Failed to create user.'}, {status: 500});       
    }
}