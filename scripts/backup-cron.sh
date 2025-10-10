#!/bin/bash

# backup-cron.sh - Script to create daily database backups

# Set environment variables
export BACKEND_URL="${BACKEND_URL:-http://backend:3000}"
export ADMIN_TOKEN="${ADMIN_TOKEN}"

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to create backup
create_backup() {
    log "Starting daily backup..."
    
    # Make API call to create backup
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        "$BACKEND_URL/backups" \
        -o /tmp/backup_response.json)
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log "Backup created successfully"
        cat /tmp/backup_response.json | grep -o '"filename":"[^"]*"' | cut -d'"' -f4 | head -1
    else
        log "ERROR: Backup failed with HTTP code $http_code"
        if [ -f /tmp/backup_response.json ]; then
            log "Response: $(cat /tmp/backup_response.json)"
        fi
        exit 1
    fi
}

# Function to cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    log "Checking for old backups to cleanup..."
    
    # Get list of backups
    response=$(curl -s -w "%{http_code}" \
        -X GET \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        "$BACKEND_URL/backups" \
        -o /tmp/backup_list.json)
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        # Parse backup list and delete old ones (this is a simplified version)
        # In production, you'd want more sophisticated cleanup logic
        log "Backup cleanup check completed"
    else
        log "WARNING: Could not retrieve backup list for cleanup"
    fi
}

# Main execution
main() {
    log "Daily backup job started"
    
    # Check if admin token is set
    if [ -z "$ADMIN_TOKEN" ]; then
        log "ERROR: ADMIN_TOKEN environment variable not set"
        exit 1
    fi
    
    # Create backup
    backup_file=$(create_backup)
    
    if [ $? -eq 0 ]; then
        log "Backup completed: $backup_file"
        
        # Cleanup old backups
        cleanup_old_backups
        
        log "Daily backup job completed successfully"
    else
        log "ERROR: Daily backup job failed"
        exit 1
    fi
}

# Run main function
main "$@"