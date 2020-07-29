FROM node:12

WORKDIR /usr/src/app

COPY ui/package.json ./ui/package.json
RUN npm install --prefix ./ui

COPY server/package.json ./server/package.json
RUN npm install --prefix ./server

COPY ui/ ./ui/
RUN npm run build --prefix ./ui/

COPY server/ ./server/

EXPOSE 80

CMD [ "npm", "run", "serve", "--prefix", "./server" ]