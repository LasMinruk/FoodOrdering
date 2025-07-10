FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5008
CMD ["node", "app.js"]
