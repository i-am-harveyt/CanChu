CREATE TABLE posts (
	id INT AUTO_INCREMENT PRIMARY KEY,
	author_id INT NOT NULL,
	context TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
);
