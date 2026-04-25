# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and Nest CLI globally
RUN npm install --production && npm install -g @nestjs/cli

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
