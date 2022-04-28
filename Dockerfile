FROM node:16

# Create app directory
WORKDIR /usr/src/app

# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY package.json .
COPY yarn.lock .

# Install app dependencies
RUN yarn install

COPY . .

LABEL name="redstone"

EXPOSE 1337
CMD NODE_ENV=production node dist/app.js
