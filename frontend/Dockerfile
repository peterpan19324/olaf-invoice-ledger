FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

# Pass --host so Vite binds to 0.0.0.0 inside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
