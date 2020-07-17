FROM node:12

WORKDIR /usr/src/app

COPY server/ ./server/
RUN npm install --prefix ./server

COPY ui/ ./ui/
RUN npm install --prefix ./ui
RUN npm run build --prefix ./ui/

COPY mazeconfig.json .

EXPOSE 80

ENV NODE_ENV=production

CMD [ "npm", "run", "serve", "--prefix", "./server" ]