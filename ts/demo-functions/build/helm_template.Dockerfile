FROM node:10-alpine as builder

RUN mkdir -p /home/node/app && \
    chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

# Install dependencies and cache them.
COPY --chown=node:node package*.json ./
RUN npm ci

# Build the source.
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node src src
RUN npm run build && \
    npm prune --production && \
    rm -r src tsconfig.json

#############################################

FROM alpine/helm:3.2.1

WORKDIR /home/node/app

COPY --from=builder /home/node/app /home/node/app

RUN apk add bash curl git
RUN apk update

RUN curl -fsSL -o /usr/local/bin/kpt https://storage.googleapis.com/kpt-dev/latest/linux_amd64/kpt
RUN chmod +x /usr/local/bin/kpt
ENV PATH /usr/local/bin:$PATH

ENTRYPOINT ["node", "/home/node/app/dist/helm_template_run.js"]
