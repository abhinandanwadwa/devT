CREATE DATABASE devT;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email_id VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255)
);

ALTER TABLE users
ADD COLUMN full_name VARCHAR(255);

DROP TABLE users;