FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/src ./src
COPY proto /proto
EXPOSE 50051
CMD ["npm", "start"]
