import { Application } from '../models/application.model.js';
import {Job} from '../models/jobs.model.js'

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const {id: jobId} = req.params;
        // const jobId = req.params.id; same as above
        if(!jobId) {
            return res.status(400).json({
                message: "Job id is required",
                success: false
            });
        }
        //check if the user already applied for the job
        const existingApplication = await Application.findOne({job: jobId, applicant: userId});
        if(existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job",
                success: false
            });
        }
        //check if job exists
        const job = await Job.findById(jobId);
        if(!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        const newApplication = await Application({
            job: jobId,
            applicant: userId
        });

        await newApplication.save();
        
        job.applications.push(newApplication._id);
        await job.save();
        
        
        return res.status(200).json({
            message: "Job applied successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        
        const application = await Application.find({applicant: userId}).sort({createdAt: -1}).populate({
            path: 'job',
            options:{sort:{createdAt: -1}},
            populate: {
                path: 'company',
                options:{sort:{createdAt: -1}}
            }//first populate for job but it will give all the details related to job. we need only company. so i use nested populate
        });

        if(!application) {
            return res.status(404).json({
                message: "No application found",
                success: false
            });
        }
        
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

//admin will se how many users have applied for particular job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;  
              
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options:{sort:{createdAt: -1}},
            populate: {
                path: 'applicant'
            } //first populate for application but it will give all the details related to application. we need only applicant. so i use nested populate
        })
        if(!job) {
            return res.status(400).json({
                message: "Job not found",
                success: false
            });
        }
        
        return res.status(200).json({
            job,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const status = req.body.status;
        
        if(!status) {
            return res.status(404).json({
                message: "status is required",
                success: false
            });
        }
        //find the application by application id
        const application = await Application.findOne({_id: applicationId});
        if(!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }
        //update status

        application.status = status.toLowerCase();
        await application.save();
        return res.status(200).json({
            message: "Status updated successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}