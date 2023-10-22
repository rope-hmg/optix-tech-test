#----------------------------------------------------------
# Building the Application
FROM node:21 as builder
WORKDIR /app

# Copy the source code
COPY ./src ./src
COPY ./index.html ./index.html

# Copy the tooling configuration files
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.node.json ./tsconfig.node.json
COPY ./vite.config.ts ./vite.config.ts
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

# Build the project
RUN npm ci
RUN npm run build

#----------------------------------------------------------
# Production Image
FROM nginx

# Copy the built application
COPY --from=builder app/dist /usr/share/nginx/html

# Copy the nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf
