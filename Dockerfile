FROM public.ecr.aws/lambda/nodejs:12

COPY . .

EXPOSE 8000

RUN apt-get update && apt-get install -y \
  ghostscript \
  libgs-dev \
  imagemagick

RUN yarn

RUN yarn build
EXPOSE 8000

CMD ["dist/app.handler"]
