import { User } from "../models/user.models.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        
        const { fullname, email, phoneNumber, password, role } = req.body;
        if (!fullname || !email || !password || !role || !phoneNumber) {
            return res.status(400).json({
                msg: "All fields are required",
                success: false
            });
        }

        const file = req.file;
        let profilePhoto = null; // Default to null if no file is uploaded

        if (file) {
            try {
                const fileUri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                profilePhoto = cloudResponse.secure_url; // Assign secure_url if upload is successful
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({
                    msg: "Error uploading profile photo",
                    success: false
                });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                msg: "Email already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto // Use the defined variable, not cloudResponse
            }
        });

        return res.status(201).json({
            msg: "Account created successfully",
            success: true
        });

    } catch (e) {
        console.error("Error in register function:", e);
        return res.status(500).json({
            msg: "Internal Server Error",
            success: false
        });
    }
};


export const login = async (req, res) => {
    try{
        const {email, password, role} = req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                msg: "All fields are required",
                success: false
            });
        }
        let user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                msg: "incorrect email or password",
                success: false
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(404).json({
                msg: "incorrect email or password",
                success: false
            });
        }
        if(role != user.role){
            return res.status(403).json({
                msg: "Account doesn't exist with current role",
                success: false
            });
        }

        const tokenData = {
            userId: user._id
        }
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn: '1d'});

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, {maxAge: 1*24*60*60*1000, httpsOnly: true, sameSite: 'strict'}).json({
            msg: `Welcome back ${user.fullname}`,
            user,
            success: true
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            msg: "Internal Server Error",
            success: false
        });
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            msg: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    try{
        const {fullname, email, phoneNumber, bio, skills} = req.body;
        //cloudinary things...
        const file = req.file;
        const userId = req.id;
        let user = await User.findById(userId);
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            
            user.profile.resume = cloudResponse.secure_url; // Save Cloudinary URL
            user.profile.resumeOriginalName = file.originalname; // Save original file name
        } else {
            // Retain the previous file if no new file is uploaded
            user.profile.resume = user.profile.resume;
            user.profile.resumeOriginalName = user.profile.resumeOriginalName;
        }

        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }

        if(!user){
            return res.status(404).json({
                msg: "User not found",
                success: false
            });
        }
        //updating data
        if(fullname) user.fullname = fullname;
        if(email)user.email = email;
        if(phoneNumber)user.phoneNumber = phoneNumber;
        if(bio)user.profile.bio = bio;
        if(skills)user.profile.skills = skillsArray;

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        }
        return res.status(200).json({
            msg: "Profile updated successfully",
            user,
            success: true
        })  
    }catch(e){
        console.log(e);
    }
}