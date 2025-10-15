# Production Deployment Guide

This guide walks through preparing and running the automated EC2 deployment for the Hotel Management System.

## 1. Prepare the EC2 Host

1. Provision an EC2 instance (Ubuntu 22.04 LTS or similar) with inbound rules for HTTP (80), HTTPS (443 if using TLS), and SSH (22).
2. SSH into the instance and install Docker Engine and the Docker Compose plugin:

   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. Create the target directory on the server (the workflow defaults to `~/hotel`).
4. (Optional) Install monitoring basics such as `htop`, `nginx`, or enable CloudWatch agents as needed.

## 2. Generate an Admin JWT for Backups

1. On your local machine, start the stack (`docker compose --profile production up -d`) and login as an admin via the API or UI.
2. Use the login response `token` or generate a token via the `/auth/login` endpoint.
3. Store this token as the GitHub secret `BACKUP_ADMIN_TOKEN` (see step 3 below). You can rotate it later by re-running the login and updating the secret.

## 3. Configure GitHub Secrets

Add the following repository secrets (`Settings ▸ Secrets and variables ▸ Actions`):

| Secret | Description |
| --- | --- |
| `EC2_HOST` | Public hostname or IP of the EC2 instance |
| `EC2_USER` | SSH username (e.g. `ubuntu`) |
| `EC2_SSH_KEY` | Private key with access to the instance (PEM contents) |
| `BACKUP_ADMIN_TOKEN` | Admin JWT used by the backup scheduler |
| `JWT_SECRET` | JWT signing key for the backend |
| `FRONTEND_URL` | Public URL for the frontend (e.g. `https://hotel.example.com`) |
| `ADMIN_EMAIL` | Admin seed email (idempotent) |
| `ADMIN_PASSWORD` | Admin seed password |
| `VITE_API_URL` | Public API URL that the frontend should call |

> You can omit optional secrets; defaults from `.env.production.example` will be used.

## 4. Configure DNS / SSL (Optional)

1. Point your domain’s DNS records to the EC2 instance (A or CNAME record).
2. For HTTPS, consider terminating TLS with a reverse proxy (nginx, Caddy, Traefik). Adjust `docker-compose.yml` or add a new service to handle certificates (e.g. [Caddy Docker image](https://caddyserver.com/docs/install#docker)).

## 5. Run the Deployment Workflow

1. Push changes to `main` (the workflow triggers automatically) **or** open the Actions tab and manually dispatch the "Deploy to EC2" workflow.
2. The workflow will:
   - Checkout the repository.
   - Open an SSH tunnel with your key.
   - Ensure the target directory exists.
   - `rsync` the repo to the EC2 host (excluding `node_modules`).
   - Render `.env.production` from the secrets.
   - Execute `docker compose --profile production up -d --build` remotely.
   - Run `docker compose ps` to show container status.
3. Monitor the job logs for errors. A typical successful run ends with all services marked `Up`.
4. The backend container runs database migrations automatically before starting the API and seeding the default admin.

## 6. Verify the Deployment

1. SSH to the instance and check the stack:

   ```bash
   ssh $EC2_USER@$EC2_HOST
   cd ~/hotel
   docker compose ps
   docker compose logs backend --tail 50
   docker compose logs frontend --tail 50
   ```

2. Hit the health endpoints:
   - Backend: `curl http://<host>:3000/health`
   - Frontend: open `http://<host>` (or your domain).
3. Test the admin login and critical workflows (bookings, food orders, etc.).
4. Confirm backups succeed by checking the backup scheduler logs:

   ```bash
   docker compose logs backup-scheduler --tail 20
   ```


## 7. Maintenance Checklist

- **Updating Secrets**: Rotate secrets by updating GitHub secret values; redeploy to refresh containers.
- **Scaling**: Increase EC2 instance size or move PostgreSQL/Redis to managed services if load grows.
- **Backups**: Regularly download or replicate the `backup_logs` volume. Consider storing generated backup files off-instance (e.g. S3).
- **Monitoring**: Enable the Prometheus/Grafana profile (`docker compose --profile monitoring up -d`) or integrate with hosted monitoring.
- **Disaster Recovery**: Keep Infrastructure-as-Code for EC2 (Terraform) and schedule periodic restore tests using backups.

## 8. Manual Rollback

If a deployment introduces issues:

1. Roll back to a previous commit locally.
2. Run the workflow again (deploying the older revision).
3. Alternatively, SSH to the instance and run `docker compose down` followed by `docker compose up -d` using cached images to restart services quickly.

## 9. Next Enhancements

- Automate TLS with a reverse proxy container (Caddy/Traefik + Let’s Encrypt).
- Add database migrations to the workflow (e.g. `pnpm run db:migrate` executed inside the backend container).
- Integrate health checks and alerting (CloudWatch alarms, PagerDuty, etc.).
- Add blue/green or rolling deployments using ECS or Nomad when scaling beyond a single host.
