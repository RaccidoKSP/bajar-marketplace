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

# Убеждаемся что папка uploads скопирована и имеет правильные права
RUN chmod 755 uploads || mkdir -p uploads && chmod 755 uploads

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]
