#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/data}"
UPLOADS_TARGET="$DATA_DIR/uploads"
DB_TARGET="$DATA_DIR/database.json"

echo "=== BAJAR Startup ==="
echo "Data directory: $DATA_DIR"

# Ensure data directory exists
mkdir -p "$UPLOADS_TARGET"

# Seed database if not present in persistent volume
if [ ! -f "$DB_TARGET" ]; then
    echo "No database found in volume. Seeding from bundled database.json..."
    cp /app/database.json "$DB_TARGET"
    echo "Database seeded: $(wc -c < "$DB_TARGET") bytes"
else
    echo "Database found: $DB_TARGET"
fi

# Seed uploads if volume is empty
if [ -z "$(ls -A "$UPLOADS_TARGET" 2>/dev/null)" ]; then
    echo "Uploads volume is empty. Seeding from bundled uploads..."
    cp -r /app/uploads/. "$UPLOADS_TARGET/"
    echo "Uploads seeded: $(ls "$UPLOADS_TARGET" | wc -l) files"
else
    echo "Uploads found: $(ls "$UPLOADS_TARGET" | wc -l) files"
fi

echo "=== Starting server ==="
exec node server.js
