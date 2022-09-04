CREATE DATABASE devT;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email_id VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255)
);