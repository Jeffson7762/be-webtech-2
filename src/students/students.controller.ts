import type { Context } from "hono";
import { pool } from "../config/db.js";
import type { Student } from "./students.model.js";
import type { ResultSetHeader } from "mysql2";

export const getStudents = async (c: Context) => {
  try {
    const [rows] = await pool.query<Student[]>('SELECT * FROM students');
    return c.json(rows);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Error getting students' }, 500);
  }
};

export const createStudent = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { first_name, last_name, email, age, course, year_level, enrollment_status } = body;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO students (first_name, last_name, email, age, course, year_level, enrollment_status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [first_name, last_name, email, age, course, year_level, enrollment_status]
    );

    const [newStudent] = await pool.query<Student[]>('SELECT * FROM students WHERE id = ?', [result.insertId]);
    return c.json(newStudent[0], 201);
  } catch (error) {
    console.error("Insert Error:", error);
    return c.json({ message: 'Error creating student' }, 500);
  }
};

export const updateStudent = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const { first_name, last_name, email, age, course, year_level, enrollment_status } = body;

    await pool.query<ResultSetHeader>(
      'UPDATE students SET first_name = ?, last_name = ?, email = ?, age = ?, course = ?, year_level = ?, enrollment_status = ? WHERE id = ?', 
      [first_name, last_name, email, age, course, year_level, enrollment_status, id]
    );

    const [updatedStudent] = await pool.query<Student[]>('SELECT * FROM students WHERE id = ?', [id]);
    return c.json(updatedStudent[0]);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Error updating student' }, 500);
  }
};

export const deleteStudent = async (c: Context) => {
  try {
    const { id } = c.req.param();
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    return c.json({ message: `Student ${id} deleted successfully` });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Error deleting student' }, 500);
  }
};