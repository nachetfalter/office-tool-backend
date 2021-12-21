FROM node:16.13.0

WORKDIR /usr/src/app

COPY . .

EXPOSE 8000

RUN yarn

CMD ["yarn", "watch"]
