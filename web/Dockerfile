FROM node:22-alpine
WORKDIR /app
COPY web/package*.json ./
RUN npm install
COPY web ./
COPY proto /proto
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
