# AESO Current Supply Demand Dashboard

# Copyright (c) 2024 Maxwell Power
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom
# the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
# AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
# ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# File: Dockerfile

# Build Stage

FROM node AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Final Image
FROM node:slim AS final
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 3000

CMD [ "node", "index.js" ]

# Metadata
LABEL maintainer="max@maxtpower.com"
LABEL org.opencontainers.image.title="aeso-dashboard"
LABEL org.opencontainers.image.description="AESO Current Supply Demand Dashboard"
LABEL org.opencontainers.image.authors="Maxwell Power"
LABEL org.opencontainers.image.source="https://github.com/maxwellpower/aeso-dashboard"
LABEL org.opencontainers.image.licenses="MIT"
