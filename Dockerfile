FROM ubuntu:16.04
RUN apt-get autoclean -y
RUN apt-get update -y
RUN apt-get install --fix-missing -y curl nodejs npm
RUN npm i -g n
RUN n 8.10.0
RUN npm i -g npm
RUN npm i -g grunt-cli
COPY . /gdp
WORKDIR /gdp
RUN npm i
RUN grunt
