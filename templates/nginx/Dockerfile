#
# Nginx Dockerfile
#
# https://github.com/anvilresearch/nginx
#

# Pull base image.
FROM alpine:3.2

# Maintainer
MAINTAINER Anvil Research, Inc. <smith@anvil.io>

# Version
ENV NGINX_VERSION 1.8.1
ENV NGINX_VERSION_RELEASE -r0

# Install nginx
RUN apk update && \
    apk add --update nginx=${NGINX_VERSION}${NGINX_VERSION_RELEASE} && \
    rm -rf /var/cache/apk/*

# Copy main config file
COPY nginx.conf /etc/nginx/nginx.conf

# Define mountable directories.
VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Define working directory.
WORKDIR /etc/nginx

# Define default command.
CMD ["nginx"]

# Expose ports.
EXPOSE 443
