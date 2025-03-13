import {Job} from '../models/jobs.model.js'
//admin post a job
export const postJob = async (req, res) => {
    try{
        const {title, description, requirements, salary, location, jobType, experience, vacancy, companyId} = req.body;
        const userId = req.id;
        if(!title || !description || !requirements || !jobType || !experience || !location || !companyId || !salary || !vacancy){
            return res.status(400).json({
                msg: "All fields are required",
                success: false
            });
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(','),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            vacancy,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            msg: "Job created successfully",
            job,
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

export const getJobs = async (req, res) => {
    try{
        const keyword = req.query.keyword || "";
        const query = {
            $or:[
                {title: {$regex: keyword, $options: 'i'}},
                {description: {$regex: keyword, $options: 'i'}},
            ]
        }
        const jobs = await Job.find(query).populate({  //when u will go to mongodb>jobs company(near vacancy) company id is mentioned but we need company's all information. So that's why we use populate
            path: 'company',
        }).sort({createdAt: -1})
        if(!jobs){
            return res.status(404).json({
                msg: "No jobs found",
                success: false
            });
        }
        return res.json({
            jobs,
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

//for students
export const getJobById = async (req, res) => {
    try{
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
        });
        if(!job){
            return res.status(404).json({
                msg: "Job not found",
                success: false
            });
        }
        return res.status(200).json({
            job,
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

//how many jobs created by admin

export const getAdminJobs = async (req, res) =>{
    try{
        const adminId = req.id;
        const jobs = await Job.find({created_by: adminId}).populate({
            path: 'company',
        });
        if(!jobs){
            return res.status(404).json({
                msg: "No jobs found",
                success: false
            });
        }
        return res.status(200).json({
            jobs,
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
