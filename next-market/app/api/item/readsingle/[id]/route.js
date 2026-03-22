import { NextResponse } from "next/server";
import connectDB from "../../../../utils/database";
import { ItemModel } from "../../../../utils/schemaModels";

export async function GET(request,{params}) {
    const {id} = await params;
    try {
        await connectDB();
        const singleItem = await ItemModel.findById(id);
        return NextResponse.json({ message: "Database connection successful!", singleItem: singleItem });
    } catch (error) {
        console.error("Error fetching item:", error);
        return NextResponse.json({ message: "Failed to fetch item." }, { status: 500 });
    }
}   