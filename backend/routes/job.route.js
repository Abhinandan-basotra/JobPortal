import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { getAdminJobs, getJobById, getJobs, postJob } from '../controllers/job.controller.js';

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/post").post(isAuthenticated, postJob);
router.route("/get/:id").get(isAuthenticated, getJobById);
export default router;
