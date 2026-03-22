import { NextResponse } from "next/server";
import connectDB from "../../../../utils/database";
import { ItemModel } from "../../../../utils/schemaModels";

export async function DELETE(request,{params}) {
    const {id} = await params;
    const reqBody = await request.json();

    try{
        await connectDB();
        const singleItem = await ItemModel.findById(id);
        if(singleItem.email === reqBody.email) {
            await ItemModel.findByIdAndDelete(id);
            return NextResponse.json({message: 'Item deleted successfully!'});
        } else {
            return NextResponse.json({message: 'Unauthorized to delete this item.'}, {status: 401});
        }
    }catch(error){
        console.error("Error deleting item:", error);
        return NextResponse.json({message: 'Failed to delete item.'}, {status: 500});
    }

    
}   