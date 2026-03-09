# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем все файлы приложения (включая database.json и uploads как seed-данные)
COPY . .

# Делаем скрипт запуска исполняемым
RUN chmod +x /app/start.sh

# Создаем директорию для данных (fallback если volume не подключен)
RUN mkdir -p /data/uploads

# Открываем порт
EXPOSE 3000

# Запускаем через скрипт инициализации
CMD ["sh", "/app/start.sh"]
