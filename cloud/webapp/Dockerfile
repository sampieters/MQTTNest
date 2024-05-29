# Temporary build environment.
FROM node:latest AS build

WORKDIR /build
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci # Freeze-install.
COPY public/ public
COPY src/ src
RUN npm run build

# Actual container image.
FROM caddy:2.7.6-alpine

# Copies built frontend into the /var/www/html directory.
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /build/build/ /srv
