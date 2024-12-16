# Fetching the latest node image on alpine linux
FROM node:22.12.0-alpine3.21 AS builder

# Declaring env
ENV NODE_ENV production


# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY  ./package.json /app

RUN npm install

# Copying all the files in our project
COPY . .

# Building our application
RUN npm run build

RUN ls

# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copying our nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf