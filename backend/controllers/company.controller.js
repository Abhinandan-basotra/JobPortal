import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
export const registerComapny = async (req, res) => {
    try{
        const {companyName}= req.body;
        
        if(!companyName){
            return res.status(400).json({
                msg: "Company name is required",
                success: false
            });
        }
        let company = await Company.findOne({name: companyName});

        if(company){
            return res.status(409).json({
                msg: "Company already exists",
                success: false
            });
        } 
        console.log("working");
        
        company = await Company.create({
            name: companyName,
            userId: req.id
        });
        return res.status(201).json({
            msg: "Company created successfully",
            company,
            success: true
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            msg: "Server Error",
            success: false
        });
    }
}

export const getCompany = async(req, res) => {
    try{
        const userId = req.id;
        
        const companies = await Company.find({userId});
        if(!companies){
            return res.status(404).json({
                msg: "Company not found",
                success: false
            });
        }
        return res.status(200).json({
            msg: "Company found successfully",
            companies,
            success: true
        });
    }catch(e){
        console.log(e);
        return res.status(500).json({
            msg: "Server Error",
            success: false
        });
    }
}

export const getCompanyById = async(req, res) => {
    try{
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if(!company){
            return res.status(404).json({
                msg: "Company not found",
                success: false
            });
        }
        return res.json({
            company,
            success: true
        });
    }catch(e){
        console.log(e);
        return res.status(500).json({
            msg: "Server Error",
            success: false
        });
    }
}

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;
        let updateData = { name, description, website, location };

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                msg: "Company not found",
                success: false,
            });
        }

        return res.status(200).json({
            msg: "Company information updated",
            company,
            success: true,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            msg: "Server Error",
            success: false,
        });
    }
};