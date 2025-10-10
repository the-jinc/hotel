# Scheduled Backup Setup

This document explains how to configure automated daily backups for the hotel management system.

## Overview

The backup system consists of:

- **Backend API**: Provides `/backups` endpoints for creating and managing backups
- **Backup Scheduler**: Docker service that runs daily cron jobs to create automated backups
- **Backup Storage**: Persistent volumes for storing backup files and logs

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with the backup admin token:

```bash
# .env
BACKUP_ADMIN_TOKEN=your-admin-jwt-token-here
```

**To get an admin JWT token:**

1. Start the application: `docker-compose up -d`
2. Register/login as an admin user via the web interface
3. Extract the JWT token from browser storage or API response
4. Set this token in the `.env` file

### 2. Production Deployment

Deploy with backup scheduler enabled:

```bash
# Start all services including backup scheduler
docker-compose --profile production up -d

# Or start only the backup scheduler
docker-compose up -d backup-scheduler
```

### 3. Verify Backup Scheduler

Check if the backup scheduler is running:

```bash
# View scheduler logs
docker-compose logs backup-scheduler

# Check backup logs
docker-compose exec backup-scheduler tail -f /var/log/backup/backup.log
```

### 4. Manual Backup Test

Test the backup system manually:

```bash
# Execute a manual backup
docker-compose exec backup-scheduler /usr/local/bin/backup-cron.sh
```

## Backup Schedule

- **Frequency**: Daily at 2:00 AM (container timezone)
- **Retention**: Configurable (default: keeps all backups)
- **Location**: Stored in backend's persistent volume
- **Format**: PostgreSQL dump files (.sql)

## Backup Management

### Via Web Interface (Admin Only)

1. Login as admin user
2. Navigate to "Admin" → "Backup Management"
3. View, create, or download backups

### Via API

```bash
# Create backup
curl -X POST http://localhost:3000/backups \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# List backups
curl -X GET http://localhost:3000/backups \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Download backup
curl -X GET http://localhost:3000/backups/download/filename.sql \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o backup.sql
```

## Monitoring and Troubleshooting

### Check Backup Status

```bash
# View recent backup attempts
docker-compose logs backup-scheduler --tail 100

# Check backup files
docker-compose exec backend ls -la /app/backups/

# View backup logs
docker-compose exec backup-scheduler cat /var/log/backup/backup.log
```

### Common Issues

1. **Authentication Failures**

   - Verify `BACKUP_ADMIN_TOKEN` is set correctly
   - Ensure the admin user account is active
   - Check token hasn't expired

2. **Network Connectivity**

   - Verify backend service is accessible from scheduler
   - Check Docker network configuration

3. **Storage Issues**
   - Ensure sufficient disk space for backups
   - Check volume mount permissions

### Backup Retention Policy

To implement automatic cleanup of old backups, modify the `backup-cron.sh` script:

```bash
# Example: Keep only last 7 days of backups
find /app/backups -name "*.sql" -mtime +7 -delete
```

## Security Considerations

1. **Token Security**: Store admin tokens securely using Docker secrets in production
2. **Access Control**: Restrict backup API access to admin users only
3. **Network Security**: Use internal Docker networks for scheduler communication
4. **Backup Encryption**: Consider encrypting backup files at rest

## Advanced Configuration

### Custom Backup Schedule

Modify the cron schedule in `Dockerfile.backup-scheduler`:

```dockerfile
# Example: Backup every 6 hours
RUN echo "0 */6 * * * /usr/local/bin/backup-cron.sh >> /var/log/backup/backup.log 2>&1" | crontab -u backup -
```

### External Storage Integration

For production systems, consider integrating with cloud storage:

```bash
# Example: Upload to S3 after creating backup
aws s3 cp /app/backups/latest.sql s3://your-backup-bucket/
```

### Monitoring Integration

Add monitoring hooks to the backup script:

```bash
# Example: Send notification on backup completion
curl -X POST "https://hooks.slack.com/..." \
  -d "{'text': 'Daily backup completed successfully'}"
```
