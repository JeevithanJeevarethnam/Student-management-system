FROM node:20-alpine

WORKDIR /app

# Install only production dependencies before copying application code.
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Supply MONGODB_URI, JWT_SECRET, and optionally CLIENT_URL at runtime.
CMD ["npm", "start"]
