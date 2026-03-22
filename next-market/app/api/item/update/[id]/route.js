import { NextResponse } from "next/server";
import connectDB from "../../../../utils/database";
import { ItemModel } from "../../../../utils/schemaModels";

export async function PUT(request,{params}) {
    const {id} = await params;
    const reqBody = await request.json();
    console.log(reqBody);

    try{
        await connectDB();
        const singleItem = await ItemModel.findById(id);
        if(singleItem.email === reqBody.email) {
            await ItemModel.findByIdAndUpdate(id, reqBody);
            return NextResponse.json({message: 'Item updated successfully!'});
        } else {
            return NextResponse.json({message: 'Unauthorized to update this item.'}, {status: 401});
        }
    }catch(error){
        console.error("Error updating item:", error);
        return NextResponse.json({message: 'Failed to update item.'}, {status: 500});
    }

    
}   