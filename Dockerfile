ARG NODE_VERSION=10.19.0
FROM node:$NODE_VERSION-alpine3.10 AS base

WORKDIR /var/app/current
COPY package.json package-lock.json ./
RUN npm config set unsafe-perm true
FROM base AS build

ARG NPM_VERSION=6.14.4
RUN npm install -g "npm@$NPM_VERSION"

RUN npm ci --userconfig npmrc --prefer-offline

# begin again from the point where we have the package file and copy over the dependencies
FROM base
COPY --from=build /var/app/current/node_modules ./node_modules

RUN npm uninstall -g npm && rm -rf /root/.npm /usr/local/bin/yarn* /opt/yarn-v*

COPY . .

ENV PORT=8080 \
    NODE_ENV=production
EXPOSE 8080

# Uses the "main" key in the package.json to determine the application command (no npm needed). See
# LOAD_AS_DIRECTORY(X) in the spec:
# https://nodejs.org/api/modules.html#modules_all_together
CMD [ "node", "--perf_basic_prof_only_functions", "--max-old-space-size=4096", "." ]
