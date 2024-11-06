FROM node:18-alpine3.17

WORKDIR /app
COPY . /app

RUN npm install
EXPOSE 5173
