import express from 'express';
import { getApiDocs } from '../controllers/docsController.js';

const router = express.Router();

router.get('/', getApiDocs);

export default router;
