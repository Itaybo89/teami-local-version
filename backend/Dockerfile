# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm install

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
