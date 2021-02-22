

# FROM zenika/alpine-chrome:86-with-puppeteer
FROM node:15-alpine
# FROM node:latest
# FROM buildkite/puppeteer:latest

# RUN apk add --no-cache  chromium 

RUN apk update && apk add --no-cache nmap && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk update && \
  apk add --no-cache \
  chromium \
  harfbuzz \
  "freetype>2.8" \
  ttf-freefont \
  nss

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

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
# RUN ls -la .

EXPOSE 8080

RUN npm install

RUN npm run build



# CMD [ "node", "app.js" ]
# CMD [ "npm", "run", "pm2" ]
# CMD ["pm2-runtime", "server.js"]
CMD ["pm2-runtime", "processes.json","--only", "screenshot"]
# CMD ["node", "server.js"]
