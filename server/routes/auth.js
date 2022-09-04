const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { body, validationResult, check } = require('express-validator');
const pool = require('../db');
const e = require('express');
var bcrypt = require('bcryptjs');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: Creating a new user in the DB: POST: http://localhost:8181/api/auth/register. No Login Required.
router.post('/register',[
    body('fullName', "Your Name Should Be At Least 4 Characters").isLength({ min: 4 }),
    body('username', "Your Username Should Be At Least 4 Characters").isLength({ min: 4 }),
    body('email', "Please Enter a Vaild Email").isEmail(),
    body('password', "Password Should Be At Least 6 Characters").isLength({ min: 6 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    try {
        
        const checkMultipleUsersEmail = await pool.query(
            "SELECT * FROM users WHERE email_id=$1",
            [req.body.email]
        );

        if (checkMultipleUsersEmail.rows.length !== 0) {
            return res.status(400).json({ error: "A User with this email id already exist" });
        }
        else {
            const checkMultipleUsersUsername = await pool.query(
                "SELECT * FROM users WHERE username=$1",
                [req.body.username]
            );

            if (checkMultipleUsersUsername.rows.length !== 0) {
                return res.status(400).json({ error: "A user with this username already exists" });
            }
            else {
                // Create a new user then
                const newUser = await pool.query(
                    "INSERT INTO users(full_name, email_id, username, password) VALUES($1, $2, $3, $4) RETURNING *",
                    [req.body.fullName, req.body.email, req.body.username, req.body.password]
                );

                let payload = {
                    user: {
                        id: newUser.id
                    }
                }

                const authtoken = jwt.sign(payload, JWT_SECRET);
                return res.json({ authtoken });
            }


        }

        // res.json(checkMultipleUsersEmail);

    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }

})

module.exports = router;