FROM node:current-alpine3.12

# Install node.js
RUN apk add --no-cache nodejs yarn git

# Copy code to app path
COPY . /app

# Set working directory to /app
WORKDIR /app

# Install packages
RUN yarn
# Allow traffic from all HOSTs
ENV HOST=0.0.0.0
# Expose port 3000
EXPOSE 3000

RUN mkdir ./db

# Start server
CMD ["yarn", "start"]
