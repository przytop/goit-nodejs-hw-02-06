FROM node:24.0.2

WORKDIR /code

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
