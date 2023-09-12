CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    pwd VARCHAR(255),
    picture VARCHAR(255),
    introduction VARCHAR(255),
    tags VARCHAR(255)
);
