FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5009
CMD ["node", "app.js"]