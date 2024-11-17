# Use Node.js base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5000 for the Express app
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]