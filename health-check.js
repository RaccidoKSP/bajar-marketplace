// Health check script for production deployment
// Run this before deploying to ensure everything is configured correctly

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка готовности к развертыванию BAJAR...\n');

let errors = 0;
let warnings = 0;

// Check 1: Node.js version
console.log('✓ Проверка версии Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 14) {
    console.error('  ❌ Node.js версия должна быть >= 14.0.0 (текущая: ' + nodeVersion + ')');
    errors++;
} else {
    console.log('  ✓ Node.js версия: ' + nodeVersion);
}

// Check 2: Required files
console.log('\n✓ Проверка обязательных файлов...');
const requiredFiles = [
    'package.json',
    'server.js',
    'index.html',
    '.env.example',
    'DEPLOYMENT.md'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log('  ✓ ' + file);
    } else {
        console.error('  ❌ Отсутствует: ' + file);
        errors++;
    }
});

// Check 3: .env file
console.log('\n✓ Проверка переменных окружения...');
if (fs.existsSync('.env')) {
    console.log('  ✓ .env файл найден');
} else {
    console.warn('  ⚠️  .env файл не найден (создайте из .env.example)');
    warnings++;
}

// Check 4: uploads directory
console.log('\n✓ Проверка директории для загрузок...');
if (fs.existsSync('uploads')) {
    const stats = fs.statSync('uploads');
    if (stats.isDirectory()) {
        console.log('  ✓ Директория uploads существует');
        
        // Check permissions
        try {
            fs.accessSync('uploads', fs.constants.W_OK);
            console.log('  ✓ Директория доступна для записи');
        } catch (err) {
            console.error('  ❌ Нет прав на запись в uploads/');
            errors++;
        }
    } else {
        console.error('  ❌ uploads должна быть директорией');
        errors++;
    }
} else {
    console.warn('  ⚠️  Директория uploads не найдена (будет создана автоматически)');
    warnings++;
}

// Check 5: package.json dependencies
console.log('\n✓ Проверка зависимостей...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'multer', 'cors', 'dotenv'];
    
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log('  ✓ ' + dep);
        } else {
            console.error('  ❌ Отсутствует зависимость: ' + dep);
            errors++;
        }
    });
    
    // Check engines
    if (packageJson.engines && packageJson.engines.node) {
        console.log('  ✓ Требования к Node.js указаны');
    } else {
        console.warn('  ⚠️  Рекомендуется указать engines в package.json');
        warnings++;
    }
} catch (err) {
    console.error('  ❌ Ошибка чтения package.json: ' + err.message);
    errors++;
}

// Check 6: database.json
console.log('\n✓ Проверка базы данных...');
if (fs.existsSync('database.json')) {
    try {
        const db = JSON.parse(fs.readFileSync('database.json', 'utf8'));
        console.log('  ✓ database.json валидный JSON');
        console.log('  ℹ️  Товаров в БД: ' + (db.items ? db.items.length : 0));
    } catch (err) {
        console.error('  ❌ database.json поврежден: ' + err.message);
        errors++;
    }
} else {
    console.warn('  ⚠️  database.json не найден (будет создан автоматически)');
    warnings++;
}

// Check 7: Security files
console.log('\n✓ Проверка безопасности...');
if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env')) {
        console.log('  ✓ .env добавлен в .gitignore');
    } else {
        console.error('  ❌ .env должен быть в .gitignore!');
        errors++;
    }
    if (gitignore.includes('node_modules')) {
        console.log('  ✓ node_modules добавлен в .gitignore');
    } else {
        console.warn('  ⚠️  node_modules должен быть в .gitignore');
        warnings++;
    }
} else {
    console.error('  ❌ .gitignore не найден');
    errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Результаты проверки:');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('✅ Все проверки пройдены! Проект готов к развертыванию.');
    process.exit(0);
} else {
    if (errors > 0) {
        console.error('❌ Найдено ошибок: ' + errors);
    }
    if (warnings > 0) {
        console.warn('⚠️  Найдено предупреждений: ' + warnings);
    }
    
    if (errors > 0) {
        console.log('\n⛔ Исправьте ошибки перед развертыванием!');
        process.exit(1);
    } else {
        console.log('\n✓ Можно продолжить, но рекомендуется исправить предупреждения.');
        process.exit(0);
    }
}
