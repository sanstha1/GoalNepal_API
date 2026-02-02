import {IUser, UserModel} from "../models/user.model"; 

export interface IUserRepository{
    createUser(data: Partial<IUser>) : Promise<IUser> ; 
    getUserbyUsername(fullName: string) : Promise<IUser|null>;
    getUserbyEmail(email: string) : Promise<IUser |null>;
    //additional
    getUserbyId(id: string) : Promise<IUser |null>; //get one
    getAllUsers() : Promise<IUser[]>; //get all
    updateUser(id: string, data: Partial<IUser>) : Promise<IUser |null>; //update one
    deleteUser(id: string) : Promise<boolean | null>; //delete one
}

//usermodel -> db.users collection
export class UserRepository implements IUserRepository{
    async createUser(data: Partial<IUser>): Promise<IUser>{
        const user = new UserModel(data); //mongodb model 
        return await user.save();
    }

     async getUserbyEmail(email: string): Promise<IUser|null>{
        const user = await UserModel.findOne({"email" : email}) ;
        return user; 
    }

     async getUserbyUsername(fullName: string): Promise<IUser|null>{
        const user = await UserModel.findOne({"fullName" : fullName});
        return user; 
    }
    async getUserbyId(id: string): Promise<IUser|null>{
        //UserModel.findOne({"_id": id})
        const user = await UserModel.findById(id);
        return user; 
    }
    async getAllUsers(): Promise<IUser[]>{
        const users = await UserModel.find();
        return users; 
    }
    async updateUser(id: string, data: Partial<IUser>): Promise<IUser|null>{
        //UserModel.updateOne({"_id":id},{$set: data})
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, {new: true});
        return updatedUser; 
    }
    async deleteUser(id: string): Promise<boolean | null>{
        //UserModel.deleteOne({"_id": id})
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null; 
    }
}