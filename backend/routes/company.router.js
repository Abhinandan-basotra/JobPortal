import express from 'express';

import { singleUpload } from '../middleware/multer.js';

import { getCompany, getCompanyById, registerComapny, updateCompany } from '../controllers/company.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

router.route('/register').post(isAuthenticated,registerComapny);
router.route('/get').get(isAuthenticated,getCompany);
router.route('/get/:id').get(isAuthenticated, getCompanyById);
router.route('/update/:id').put(isAuthenticated, singleUpload ,updateCompany);
export default router;
