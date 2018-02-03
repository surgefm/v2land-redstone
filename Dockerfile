FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Install app dependencies
RUN npm -g install sails
RUN npm install

LABEL name="redstone"

EXPOSE 1337
CMD [ "npm", "start" ]