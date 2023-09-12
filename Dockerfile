FROM node:18.16.1-alpine3.17
WORKDIR /app
ADD . /app
RUN npm install
EXPOSE 3000
CMD npm start
