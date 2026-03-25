FROM node:20-alpine

WORKDIR /app

# Bağımlılıkları önce kopyala (cache optimizasyonu)
COPY package*.json ./
RUN npm install --production

# Uygulama dosyalarını kopyala
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
