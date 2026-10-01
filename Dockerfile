FROM node:6-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm install whatwg-url@7
CMD ["npm", "test"]
