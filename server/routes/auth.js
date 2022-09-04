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

                var salt = await bcrypt.genSalt(10);
                var hash = await bcrypt.hash(req.body.password, salt);

                const newUser = await pool.query(
                    "INSERT INTO users(full_name, email_id, username, password) VALUES($1, $2, $3, $4) RETURNING *",
                    [req.body.fullName, req.body.email, req.body.username, hash]
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

});




















// Route 2: Authenticating an existing user: POST: http://localhost:8181/api/auth/login. No Login Required
router.post('/login', [
    body('username', "Please Enter a Vaild Username").isLength({ min: 4 }),
    body('password', "Password Should Be At Least 6 Characters").isLength({ min: 6 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    try {
        const theUser = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [req.body.username]
        );

        if (theUser.rows.length !== 0) {
            let checkHash = await bcrypt.compare(req.body.password, theUser.rows[0].password);
            if (checkHash) {
                let payload = {
                    user: {
                        id: theUser.rows[0].user_id
                    }
                }
                const authtoken = jwt.sign(payload, JWT_SECRET);
                return res.status(200).json({ authtoken });
            }
            else {
                return res.status(403).json({ error: "Invalid Credentials" });
            }
        }
        else {
            return res.status(403).json({ error: "Invalid Credentials" });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;