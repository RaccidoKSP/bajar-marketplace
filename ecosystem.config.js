// PM2 ecosystem configuration file
// Используется для управления процессами в production

module.exports = {
  apps: [{
    name: 'bajar',
    script: './server.js',
    instances: 'max', // Использовать все CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
