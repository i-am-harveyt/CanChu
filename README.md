# CanChu –– A Social Media Website

[[TOC]]

## Project Introduction

This is a Social Media Website based on JS and MySQL.

In this website, users can make friends, posts, and interactions just like those actions that performs on daily social media actions.

In this summer, I do some research towards the techinical parts described below and build some APIs for Front-end schoolmates.

## Technical Description

### VCS -- Git

To establish a practical co-work method, we use Git to control our versions, so every states in development cycle is securely saved, both on local side and remote side.

### Web Framework -- Express JS

We build this project using [Express JS](https://github.com/expressjs/expressjs.com).

#### Router

We mainly use Routers to manage our API route, which contributes to a clearly file structure, to separate routers control for specific functions from others, like this:

```
routes
├── chat.route.js
├── events.route.js
├── friends.route.js
├── groups.route.js
├── posts.route.js
└── users.route.js
```

#### Middleware

Using middleware, we can easily reuse our code, especially like `headerTypeCheck`, we almost use in every api.

```javascript
const isJSON = (req, res, next) => {
  if (!req.is("application/json")) {
    err400(res, { error: "Wrong Format" });
    return;
  }
  next();
};
```

Moreover, some of packages fully depends on the usage of middleware, like [multer](https://github.com/expressjs/multer)

### Network -- Nginx

In this project, I embeded [NGINX](https://www.nginx.com/) into docker-compose, so running NGINX may not be big problem. However, it may be complicated when it comes to NGINX setup.

In my case, my config file is mainly in `/etc/nginx/conf.d/default.conf`

```
# /etc/nginx/conf.d/deafult.conf
server {
    listen 80 ssl;
    server_name $SERVER_NAME;
    access_log /var/log/nginx/nginx.vhost.access.log;
    error_log /var/log/nginx/nginx.vhost.error.log;
    location / {
        proxy_pass http://$NGINX_HOST:$PORT;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl;
    ssl			on;
    ssl_certificate		/etc/ssl/certif.crt;
    ssl_certificate_key	/etc/ssl/private.key;
    server_name $SERVER_NAME;
    access_log /var/log/nginx/nginx.vhost.access.log;
    error_log /var/log/nginx/nginx.vhost.error.log;
    location / {
        proxy_pass http://$NGINX_HOST:$PORT;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Setting up `SERVER`, `NGINX_HOST` and `PORT` is prerequisite. Otherwise it can only serve HTTP requests, which is quite restricted nowadays.

### Database -- MySQL

[MySQL](https://www.mysql.com/) is used in this project, also bundled in docker-compose. But it is also recommended using [RDS](https://aws.amazon.com/rds/), to provide a more secure and unified, consistant place to link and read/write to.

To work with MySQL, I use [mysql2](https://github.com/sidorares/node-mysql2#readme), which provide a fine APIs, robust performance that I can easily work with.

### Cache -- Redis

### Containerize -- Docker

### CI/CD -- Github Action

### Deployment -- AWS EC2 & RDS && Load Balancer
