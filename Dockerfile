# Use the official Node.js image as a base
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from server folder
COPY server/package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force && rm -rf /root/.npm && rm -rf /tmp/*

# Copy the server application code
COPY server/ ./

# Set the NODE_ENV environment variable
ENV NODE_ENV=production

# Expose the port the app runs on (adjust as needed)
EXPOSE 1111

# Start the application
CMD ["npm", "run", "start:prod"]