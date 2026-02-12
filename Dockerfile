# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы приложения
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads && chmod 755 uploads

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]
