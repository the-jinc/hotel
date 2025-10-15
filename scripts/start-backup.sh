#!/bin/bash
set -e

# start-backup.sh - Initializes the cron daemon inside the backup scheduler container

echo "Starting backup scheduler..."
echo "Daily backup scheduled for 2:00 AM (container timezone)"
echo "Current time: $(date)"
if [ -z "${ADMIN_TOKEN}" ]; then
  echo "WARNING: ADMIN_TOKEN is not set. Backup API calls will fail until a valid token is provided." >&2
fi
echo "Cron daemon starting..."
exec /usr/sbin/crond -f -l 2
