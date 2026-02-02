//yo folder ma chahi database configure garney after adding dotenv in the index.ts inside the config folder this is second step 
import mongoose from 'mongoose'; 
import { MONGODB_URI } from '../config/env';

export async function connectDatabase(){
    try{
        await mongoose.connect(MONGODB_URI); //connection yesle build garney bhayo 
        console.log("Database connected successfully"); //successful message 

    }catch(error){
        console.error("Database error", error); 
        process.exit(1); //exit application on exception 
    }
}
