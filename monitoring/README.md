# Hotel Management System Monitoring

This directory contains monitoring configuration for the Hotel Management System using **Prometheus** and **Grafana**.

## What are Prometheus and Grafana?

### Prometheus

- **Time-series database** that collects metrics from applications and services
- **Pull-based monitoring** - Prometheus scrapes metrics from configured targets
- **Powerful query language** (PromQL) for analyzing metrics
- **Alerting capabilities** based on metric thresholds

### Grafana

- **Visualization platform** for creating dashboards from various data sources
- **Rich dashboarding** with graphs, charts, tables, and alerts
- **Multiple data sources** support (Prometheus, InfluxDB, Elasticsearch, etc.)
- **Real-time monitoring** with auto-refresh capabilities

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │───▶│ Prometheus  │───▶│   Grafana   │
│  (Metrics)  │    │ (Storage)   │    │ (Dashboards)│
└─────────────┘    └─────────────┘    └─────────────┘
```

## Starting the Monitoring Stack

To start the complete monitoring stack:

```bash
# Start all monitoring services
docker-compose --profile monitoring up

# Or start individual services
docker-compose --profile monitoring up prometheus grafana
```

**Access URLs:**

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090

## Metrics Collected

### Application Metrics

- **HTTP Request Metrics**: Request count, duration, status codes
- **Business Metrics**: Booking operations, food orders
- **System Metrics**: CPU, memory, active connections
- **Database Metrics**: Query performance, connection counts

### Custom Metrics

- `http_requests_total{method, route, status_code}` - Total HTTP requests
- `http_request_duration_seconds{method, route, status_code}` - Request duration histogram
- `booking_operations_total{operation, status}` - Booking operations counter
- `food_order_operations_total{operation, status}` - Food order operations counter
- `active_connections` - Current active connections gauge
- `database_query_duration_seconds{operation, table}` - Database query duration

## Dashboard

The system includes a comprehensive dashboard (`hotel-overview.json`) that shows:

- **API Request Rate** - Requests per second by endpoint
- **API Response Time** - 95th percentile response times
- **Booking Operations** - Success/failure rates for booking operations
- **Active Connections** - Current number of active connections
- **HTTP Status Codes** - Distribution of response status codes
- **System CPU Usage** - Backend CPU utilization

## Configuration Files

- `prometheus/prometheus.yml` - Prometheus scraping configuration
- `grafana/provisioning/datasources/` - Grafana datasource configuration
- `grafana/provisioning/dashboards/` - Dashboard provisioning
- `grafana/dashboards/` - Dashboard JSON files

## Adding Custom Metrics

To add more metrics to your application:

1. **Import metrics** in your service files:

   ```typescript
   import {
     bookingOperationsTotal,
     databaseQueryDuration,
   } from "../metrics.js";
   ```

2. **Use metrics** in your business logic:

   ```typescript
   bookingOperationsTotal.labels("create", "success").inc();
   databaseQueryDuration.labels("create_booking", "bookings").observe(duration);
   ```

3. **Create dashboard panels** in Grafana using PromQL queries.

## Alerting

You can set up alerts in Prometheus for:

- High error rates (>5%)
- Slow response times (>2s)
- High CPU/memory usage
- Failed booking operations

## Security Notes

- **Change default Grafana credentials** in production
- **Restrict Prometheus/Grafana access** behind authentication
- **Use HTTPS** for all monitoring endpoints
- **Regularly update** Prometheus and Grafana versions
