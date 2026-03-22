import { NextResponse } from "next/server";
import connectDB from "../../../utils/database";
import { ItemModel } from "../../../utils/schemaModels";

export async function GET() {
    try {
        await connectDB();
        const allItems = await ItemModel.find();
        return NextResponse.json({ message: "Database connection successful!", allItems: allItems });
    } catch (error) {
        return NextResponse.json({ message: "Database connection failed.", error: error.message });
    }}
    
export const revalidate = 0;