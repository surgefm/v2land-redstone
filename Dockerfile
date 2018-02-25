FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install -g yarn
RUN yarn

LABEL name="redstone"

EXPOSE 1337
CMD NODE_ENV=production yarn start