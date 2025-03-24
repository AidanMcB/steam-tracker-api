FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3008

# Expose the port
EXPOSE 3008

# Start the application
CMD ["node", "dist/index.js"] 