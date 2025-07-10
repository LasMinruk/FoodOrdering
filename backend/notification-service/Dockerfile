FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose the port the app runs on
EXPOSE 5003

# Run the app
CMD ["node", "server.js"]
