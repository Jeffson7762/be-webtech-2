import { Hono } from 'hono';
import studentsRoute from '../students/students.route.js';

const api = new Hono();

// All student routes will now be prefixed with /students
api.route('/students', studentsRoute);

export default api;