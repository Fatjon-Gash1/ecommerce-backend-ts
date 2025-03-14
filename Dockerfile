FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install --legacy-peer-deps

RUN npm install -g typescript

COPY . ./

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
