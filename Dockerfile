# Step 1: Build the Angular application
FROM node:16 AS build
WORKDIR /app

# Install the Angular CLI globally in the container
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the project's npm dependencies
RUN npm install 

# Copy the rest of the application into the container
COPY . .

# Build the Angular app
RUN ng build --configuration production --source-map

# Step 2: Serve the Angular application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/front-end /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
