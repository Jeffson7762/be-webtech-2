import { Hono } from 'hono'
import sqlite3 from 'sqlite3'

const app = new Hono()

// Initialize SQLite database
const db = new sqlite3.Database('./data/db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message)
  }
  console.log('Connected to the SQLite database.')
})

// Function to validate the input for POST and PUT
const validateStudentData = (data) => {
  const errors = []
  
  // Check for required fields
  if (!data.first_name || !data.last_name || !data.email || !data.course) {
    errors.push('First name, last name, email, and course are required.')
  }

  // Email validation using regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(data.email)) {
    errors.push('Invalid email format.')
  }

  // Age validation (should be between 16 and 100)
  if (data.age < 16 || data.age > 100 || !Number.isInteger(data.age)) {
    errors.push('Age must be a valid integer between 16 and 100.')
  }

  // GPA validation (should be between 0.0 and 4.0)
  if (data.gpa < 0.0 || data.gpa > 4.0) {
    errors.push('GPA must be between 0.0 and 4.0.')
  }

  return errors
}

// Endpoint to retrieve all students
app.get('/students', (c) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) {
        reject(err)
      }
      resolve(c.json(rows))
    })
  })
})

// Endpoint to retrieve a single student by ID
app.get('/students/:id', (c) => {
  const studentId = c.req.param('id')
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, row) => {
      if (err) {
        reject(err)
      }
      if (!row) {
        return resolve(c.json({ error: 'Student not found' }, 404))
      }
      resolve(c.json(row))
    })
  })
})

// Endpoint to create a new student
app.post('/students', (c) => {
  return c.req.json().then((data) => {
    // Validate the input data
    const errors = validateStudentData(data)
    if (errors.length > 0) {
      return c.json({ errors }, 400)
    }

    // Check if the email already exists in the database
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM students WHERE email = ?', [data.email], (err, row) => {
        if (err) {
          reject(err)
        }
        if (row) {
          return resolve(c.json({ error: 'Email already exists' }, 400))
        }

        // Insert the new student into the database
        const query = 'INSERT INTO students (first_name, last_name, email, age, course, gpa, enrollment_status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        db.run(query, [data.first_name, data.last_name, data.email, data.age, data.course, data.gpa, 'Active'], function (err) {
          if (err) {
            reject(err)
          }
          resolve(c.json({ message: 'Student created successfully', id: this.lastID }, 201))
        })
      })
    })
  })
})

// Endpoint to update an existing student
app.put('/students/:id', (c) => {
  const studentId = c.req.param('id')

  return c.req.json().then((data) => {
    // Validate the input data
    const errors = validateStudentData(data)
    if (errors.length > 0) {
      return c.json({ errors }, 400)
    }

    // Check if student exists
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, row) => {
        if (err) {
          reject(err)
        }
        if (!row) {
          return resolve(c.json({ error: 'Student not found' }, 404))
        }

        // Check if email is already taken by someone else
        db.get('SELECT * FROM students WHERE email = ? AND id != ?', [data.email, studentId], (err, emailRow) => {
          if (err) {
            reject(err)
          }
          if (emailRow) {
            return resolve(c.json({ error: 'Email already exists' }, 400))
          }

          // Update the student record
          const query = 'UPDATE students SET first_name = ?, last_name = ?, email = ?, age = ?, course = ?, gpa = ?, enrollment_status = ? WHERE id = ?'
          db.run(query, [data.first_name, data.last_name, data.email, data.age, data.course, data.gpa, 'Active', studentId], (err) => {
            if (err) {
              reject(err)
            }
            resolve(c.json({ message: 'Student updated successfully' }))
          })
        })
      })
    })
  })
})

// Endpoint to delete a student by ID
app.delete('/students/:id', (c) => {
  const studentId = c.req.param('id')
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM students WHERE id = ?', [studentId], (err, row) => {
      if (err) {
        reject(err)
      }
      if (!row) {
        return resolve(c.json({ error: 'Student not found' }, 404))
      }

      // Delete the student record from the database
      db.run('DELETE FROM students WHERE id = ?', [studentId], (err) => {
        if (err) {
          reject(err)
        }
        resolve(c.json({ message: 'Student deleted successfully' }))
      })
    })
  })
})

// Start the server on port 3000
app.listen(3000)
