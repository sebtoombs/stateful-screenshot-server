# FROM zenika/alpine-chrome:86-with-puppeteer
FROM node:10-alpine

RUN apk add --no-cache  chromium 

USER root 

# RUN mkdir -p /home/chrome/app/node_modules && chown -R chrome:chrome /home/chrome/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# RUN mkdir -p /usr/etc && chown -R chrome:chrome /usr/etc

# WORKDIR /home/chrome/app
WORKDIR /home/node/app

COPY ./package*.json ./proxy/

# RUN npm -g config set user chrome
RUN npm -g config set user node
RUN npm install pm2 -g

# USER chrome
USER node

# COPY --chown=chrome:chrome . .
COPY --chown=node:node . .

EXPOSE 8080

RUN npm install



# CMD [ "node", "app.js" ]
# CMD [ "npm", "run", "pm2" ]
# CMD ["pm2-runtime", "server.js"]
CMD ["pm2-runtime", "processes.json","--only", "screenshot"]
# CMD ["node", "server.js"]
