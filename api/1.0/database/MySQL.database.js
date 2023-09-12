import { createPool } from "mysql2";
import { config } from "dotenv";
import timeFormatter from "../utils/timeFormatter.util.js";
config();

class DB {
  constructor() {
    // Load some config
    this.pool = createPool({
      connectionLimit: 10,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    this.query = "";
    this.constrs = "";
    this.join = "";
    this.set = "";
  }

  /**
   * @method update
   * @param {string} table
   * @param <Object> {key: new_value}
   * @returns{DB} the Object itself
   */
  update(table = "", pairs = {}) {
    this.query += ` UPDATE ${table}`;

    pairs = Object.entries(pairs);

    this.set = ` SET ${pairs
      .map((e) =>
        typeof e[1] === "string" ? `${e[0]}='${e[1]}'` : `${e[0]}=${e[1]}`,
      )
      .join(",")}`;
    return this;
  }

  /**
   * @method select
   * @param {string} table
   * @param {Array<string>} list of column names
   * @returns{DB} the Object itself
   */
  select(table = "", cols = []) {
    this.query += ` SELECT ${
      cols.length > 0 ? cols.join(",") : "*"
    } FROM ${table} `;
    return this;
  }

  /**
   * @method insert
   * @param {string} table
   * @param {Object}
   * @returns{DB} the Object itself
   */
  insert(table = "", data = null, ignore = false) {
    if (!data) return null;
    this.query += ` INSERT ${ignore ? "IGNORE" : ""} INTO ${table}
			(
			${Object.keys(data).join(",")}
			) VALUES (
			${Object.values(data)
        .map((e) => (typeof e === "string" ? `'${e}'` : e))
        .join(",")}
			)`;
    return this;
  }

  /**
   * @method delete
   * @param {string} table
   * @param {string} abbr IS NEEDED IF USING JOIN
   * @returns{DB} the Object itself
   */
  delete(table = "", abbr = "") {
    this.query += ` DELETE ${abbr} FROM ${table} ${abbr}`;
    return this;
  }

  /**
   * @method where
   * @param {string} constraint
   * @returns{DB} the Object itself
   */
  where(constr = "") {
    this.constrs += ` WHERE (${constr})`;
    return this;
  }

  /**
   * @method inner_join
   * @param {string} table name
   * @returns{DB} the Object itself
   */
  inner_join(table = "") {
    this.join += ` INNER JOIN ${table}`;
    return this;
  }

  /**
   * @method left_join
   * @param {string} table name
   * @returns{DB} the Object itself
   */
  left_join(table = "") {
    this.join += ` LEFT JOIN ${table}`;
    return this;
  }

  /**
   * @method on
   * @param {string} key mapping
   * @returns{DB} the Object itself
   */
  on(mapping = "") {
    this.join += ` ON ${mapping}`;
    return this;
  }

  /**
   * @method execute
   * @returns{Promise}
   */
  async execute() {
    const query = [this.query, this.join, this.set, this.constrs].join("\n");
    (this.query = ""), (this.join = ""), (this.set = ""), (this.constrs = "");
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query(query, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async postSearch(userId, cursor = "", queryId = "", perPage=1000) {
    userId = parseInt(userId);
    cursor = parseInt(atob(cursor)[0]);
    if (!cursor) cursor = Number.MAX_SAFE_INTEGER;
    queryId = parseInt(queryId);

    const query = `
			WITH
			authors AS (
				SELECT id
				FROM 
				${
          queryId
            ? "(SELECT id FROM users WHERE id=?)"
            : "(SELECT CASE WHEN from_id = ? THEN to_id WHEN to_id = ? THEN from_id ELSE ? END AS id FROM friendship WHERE id=1 OR ((from_id = ? OR to_id = ?) AND status = 1) ORDER BY id DESC)"
        }
			AS derived),
			add_post AS (
				SELECT id, author_id, context, created_at
				FROM posts
				WHERE (author_id IN (SELECT id FROM authors) or author_id=?) AND id < ?
				ORDER BY created_at DESC
				LIMIT ${perPage + 1}
			),
			add_comment AS (
				SELECT B.*, COUNT(C.id) AS comment_count
				FROM add_post B
				LEFT JOIN comments C ON B.id = C.post_id
				GROUP BY B.id
			),
			add_like AS (
				SELECT B.*, COUNT(L.id) AS like_count
				FROM add_comment B
				LEFT JOIN likes L ON B.id = L.post_id
				GROUP BY B.id
			)
			SELECT B.*, CASE WHEN L.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
			FROM add_like B
			LEFT JOIN likes L ON L.post_id = B.id AND L.user_id=?;
		`;

    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(
          query,
          queryId
            ? [queryId, userId, cursor, userId]
            : [userId, userId, userId, userId, userId, userId, cursor, userId],
          (err, result) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }
            result.map((row) => {
              row.created_at = timeFormatter(row.created_at);
            });
            resolve(result);
          },
        );
      });
    });
  }

  async fetchProfile(self_id, query_id) {
    const query = `
			SELECT
				u.id, u.name, u.picture,
				u.introduction, u.tags,
				(
					SELECT COUNT(*)
					FROM friendship f1
					WHERE (f1.from_id=? OR f1.to_id=?) AND (f1.status=TRUE)
				) AS friend_count,
				(
					SELECT f2.id
					FROM friendship f2
					WHERE
						(f2.from_id=? AND f2.to_id=?)
						OR
						(f2.from_id=? AND f2.to_id=?)
					LIMIT 1
				) AS fid,
				CASE
					WHEN f.status=TRUE THEN 'friend'
					WHEN f.from_id=? THEN 'pending'
					WHEN f.to_id=? THEN 'requested'
					ELSE NULL
				END AS status
			FROM users u
			LEFT JOIN friendship f
			ON
			(f.from_id=u.id AND f.to_id=?)
			OR
			(f.from_id=? AND f.to_id=u.id)
			WHERE u.id = ?;
		`;
    const params = [
      query_id,
      query_id,
      query_id,
      self_id,
      self_id,
      query_id,
      query_id,
      query_id,
      self_id,
      self_id,
      query_id,
    ];

    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          if (result[0].fid) {
            result[0].friendship = {
              id: result[0].fid,
              status: result[0].status,
            };
          } else {
            result[0].friendship = null;
          }
          delete result[0].fid;
          delete result[0].status;
          resolve(result);
        });
      });
    });
  }

  async userSearch(self_id, keyword) {
    const query = `
			SELECT
			u.id, u.name, u.picture, f.id AS fid, f.status
			FROM users u
			LEFT JOIN friendship f
			ON (f.from_id=? AND f.to_id=u.id) OR (f.to_id=? AND f.from_id=u.id)
			WHERE u.name LIKE ?
		`;
    const params = [self_id, self_id, `%${keyword}%`];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          result.map((row) => {
            if (row.fid) {
              row.friendship = {
                id: row.fid,
                status: row.status,
              };
            } else {
              row.friendship = null;
            }
            delete row.fid;
            delete row.status;
          });
          resolve(result);
        });
      });
    });
  }

  async friendshipAgree(fid, uid) {
    const query = `
			UPDATE friendship f
			SET f.status=TRUE
			WHERE f.id=? AND f.to_id=?
		`;
    const params = [fid, uid];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async friendFindSender(fid) {
    const query = `SELECT f.from_id FROM friendship f WHERE id=?`;
    const params = [fid];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async friendshipPending(id = -1) {
    const query = `
			SELECT
			u.id, u.name, u.picture, f.id AS fid
			FROM users u
			INNER JOIN friendship f
			ON f.from_id=u.id
			WHERE f.to_id=? AND f.status=FALSE
		`;
    const params = [id];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          result.map((row) => {
            row.friendship = {
              id: row.fid,
              status: "pending",
            };
            delete row.fid;
          });
          resolve(result);
        });
      });
    });
  }

  async friendshipDelete(fid, uid) {
    const query = `
			DELETE FROM friendship f
			WHERE f.id=? AND (f.from_id=? OR f.to_id=?)
		`;
    const params = [fid, uid, uid];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async postDetail(pid, uid) {
    const query = `
			SELECT 
			p.id AS id,
			p.created_at,
			p.context,
			(SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
			(SELECT COUNT(id) FROM likes WHERE post_id=p.id) AS like_count,
			u.id AS user_id,
			u.picture,
			u.name
			FROM (
				SELECT id, created_at, context, author_id
			) p
      LEFT JOIN likes l
      ON l.post_id=p.id
      LEFT JOIN users u
      ON p.author_id=u.id
      WHERE p.id=?
		`;
    const params = [uid, pid];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async getEvents(user_id) {
    const query = `
			SELECT e.id, e.type, e.is_read, e.created_at, u2.picture, u2.name
			FROM events e
			INNER JOIN users u1
			ON e.user_id=u1.id
			INNER JOIN users u2
			ON e.evoker_id=u2.id
			WHERE u1.id=?
			ORDER BY e.created_at DESC
		`;
    const params = [user_id];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async getFriendship(fid) {
    const query =
      "SELECT id, from_id, to_id, status, time FROM friendship WHERE id=?";
    const param = [fid];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, param, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async sendRequest(from_id, to_id) {
    const query = "INSERT INTO friendship (from_id, to_id) VALUES (?, ?) ";
    const params = [from_id, to_id];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async createGroup(userId = 0, groupName = "") {
    const query = "INSERT INTO `groups` (owner_id, name) VALUES(?, ?);";
    const params = [userId, groupName];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async deleteGroup(userId = 0, groupId = 0) {
    const query = "DELETE FROM `groups` WHERE owner_id=? AND id=?";
    const params = [userId, groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async checkWithinGroup(userId = 0, groupId = 0) {
    const query = `SELECT id, status FROM group_members WHERE user_id=? AND group_id=?`;
    const params = [userId, groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupJoin(userId = 0, groupId = 0, isCreator = false) {
    const query = `INSERT INTO group_members (user_id, group_id ${
      isCreator ? ", status" : ""
    }) VALUES (?, ? ${isCreator ? ", TRUE" : ""})`;
    const params = [userId, groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupPending(userId = 0, groupId = 0) {
    const query = `
			SELECT
			u.id,
			u.name,
			u.picture, 'pending' as status
			FROM group_members gm
			INNER JOIN users u ON u.id=gm.user_id
			WHERE gm.status=0 AND gm.status=0
		`;
    const params = [userId, groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupInfo(groupId = 0) {
    const query =
      "SELECT id, owner_id, name, created_at FROM `groups` WHERE id=?";
    const param = [groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, param, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupAgree(groupId = 0, applicantId = 0) {
    const query =
      "UPDATE group_members SET status=1 WHERE group_id=? AND user_id=?";
    const params = [groupId, applicantId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupPost(groupId = 0, authorId = 0, context = null) {
    const query = `
			INSERT INTO group_posts
			(group_id, author_id, context)
			VALUES
			(?, ?, ?)
		`;
    const params = [groupId, authorId, context];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async groupPosts(groupId = 0) {
    const query = `
			SELECT
			gp.id,
			gp.author_id as user_id,
			gp.created_at,
			gp.context,
			'false' as is_liked,
			0 as like_count,
			0 as comment_count,
			u.picture as picture,
			u.name as name
			FROM group_posts gp
			INNER JOIN users u
			ON u.id=gp.author_id
			WHERE gp.group_id=?
			ORDER BY gp.id DESC
		`;
    const param = [groupId];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, param, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          result.map((row) => {
            row.created_at = timeFormatter(row.created_at);
          });
          resolve(result);
        });
      });
    });
  }

  async sendMessage(fromId = 0, toId = 0, message = "") {
    const query = `
			INSERT INTO messages
			(from_id, to_id, message)
			VALUES
			(?, ?, ?)
		`;
    const params = [fromId, toId, message];
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  async searchMessages(userId = 0, queryId = 0, cursor = "") {
    const query = `
			SELECT
			m.id, m.message, m.created_at,
			u.id as uid, u.name as name, u.picture as picture
			FROM messages m
			INNER JOIN users u ON u.id=m.from_id
			WHERE
			${cursor ? "m.id <= ? AND" : ""}
			((m.from_id=? AND m.to_id=?)
			OR
			(m.from_id=? AND m.to_id=?))
			ORDER BY m.id DESC
			LIMIT 11;
		`;
    const params = cursor
      ? [cursor, userId, queryId, queryId, userId]
      : [userId, queryId, queryId, userId];

    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, params, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          result.map((row) => {
            row.created_at = timeFormatter(row.created_at);
            row.user = {
              id: row.uid,
              name: row.name,
              picture: row.picture,
            };
            delete row.uid;
            delete row.name;
            delete row.picture;
          });
          resolve(result);
        });
      });
    });
  }
}

const db = new DB();

export { DB, db };
