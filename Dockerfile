FROM node:14.15.4-buster-slim@sha256:c8b73b9968457ee4969050955031efe0943d7770e38eeec2943debefd4d28cfd

RUN apt-get update
RUN apt install -y chromium

COPY --chown=node:node . .
RUN npm install
RUN npm run build

EXPOSE 8080


ENV  PATH="${PATH}:/node_modules/.bin"

CMD [ "npm", "run", "start" ]