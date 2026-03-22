import mongoose from "mongoose";
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://mclareny3:Yuta0330@cluster0.3sc90jp.mongodb.net/nextAppDataBase?appName=Cluster0"
        );
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;