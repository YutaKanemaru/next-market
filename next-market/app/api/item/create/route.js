import {NextResponse} from 'next/server';
import connectDB from '../../../utils/database';
import { ItemModel } from '../../../utils/schemaModels';

export async function POST(request) {
    const reqBody = await request.json();
    console.log(reqBody);

    try{
        await connectDB();
        await ItemModel.create(reqBody);
        return NextResponse.json({message: 'Item created successfully!'});
    }catch{
        return NextResponse.json({message: 'Failed to create item.'});
    }

    
}