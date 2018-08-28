FROM node:7-alpine

RUN mkdir -p /src/app
WORKDIR /src/app

COPY index.js /src/app/index.js
COPY package.json  /src/app/package.json
RUN npm install --production

COPY /build/es5-bundled /src/app/build/es5-bundled

EXPOSE 8080
CMD ["node", "index.js"]


# CMD :: docker build -t aqa/aqa-portal:0.0.2 .
# CMD :: docker tag aqa/aqa-portal:0.0.2 deploy.onesqa.com:5000/aqa/aqa-portal:0.0.2
# CMD :: docker push deploy.onesqa.com:5000/aqa/aqa-portal:0.0.2

# Other
# CMD :: docker rm -f $(docker ps -a -q)
# CMD :: docker rmi -f $(docker images -a -q)
# CMD :: docker run -p 8080:8080 aqa/aqa-portal:0.0.2