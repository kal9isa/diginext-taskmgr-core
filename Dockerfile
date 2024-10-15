# Use Node.js LTS as base image
FROM node:20

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
