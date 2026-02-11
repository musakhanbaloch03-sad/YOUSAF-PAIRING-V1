FROM node:20-alpine

LABEL maintainer="Muhammad Yousaf Baloch <musakhanbaloch03@gmail.com>"
LABEL version="3.0.0"

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["npm", "start"]
