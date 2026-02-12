// be-webtect2/src/config/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// In-memory storage for demonstration
let students = [];

const api = new Hono();

// ✅ Enable CORS for all routes in this API
api.use('*', cors());

// GET all students
api.get('/students', (c) => {
  return c.json(students);
});

// POST a new student
api.post('/students', async (c) => {
  try {
    // Parse JSON body
    const student = await c.req.json();

    // Simple ID assignment
    student.id = students.length > 0 ? students[students.length - 1].id + 1 : 1;

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'age', 'course', 'year_level', 'gpa', 'enrollment_status'];
    for (const field of requiredFields) {
      if (!student[field]) {
        return c.json({ error: `${field} is required` }, 400);
      }
    }

    // Add student to in-memory storage
    students.push(student);

    return c.json(student, 201);
  } catch (error) {
    console.error('Error creating student:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// DELETE a student by ID
api.delete('/students/:id', (c) => {
  try {
    const id = Number(c.req.param('id'));
    students = students.filter((s) => s.id !== id);
    return c.json({ message: 'Student deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return c.json({ error: 'Failed to delete student' }, 500);
  }
});

export default api;
