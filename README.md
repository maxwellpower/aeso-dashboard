## AESO Current Supply Demand Dashboard

### Overview
The AESO Current Supply Demand Dashboard is a comprehensive tool for visualizing and analyzing the current supply and demand data from the Alberta Electric System Operator (AESO). This application uses Docker to deploy an API server, InfluxDB for data storage, and Grafana for data visualization, along with Caddy for HTTPS management.

### Prerequisites
Ensure you have the following installed on your system:
- Docker
- Docker Compose

### Setup Instructions
1. **Clone the Repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create .env File**:
   Copy `defaults.env` to `.env` in the root directory and edit in the necessary environment variables as shown above.

### Running the Application
To start the application, navigate to the root directory of your project and run:
```sh
docker-compose up -d
```
This command will start all the services defined in your `docker-compose.yml` file.

### Accessing the Dashboard
After starting the application, you can access:
- **Grafana**: `https://dashboard.localhost` (or replace `localhost` with your actual domain).
- **InfluxDB**: `https://influx.localhost` (or replace `localhost` with your actual domain).

Use the credentials defined in your `.env` file to log in.

### Troubleshooting
If you encounter issues, try the following:
- Check the Docker container logs for any errors:
  ```sh
  docker-compose logs
  ```
- Ensure your environment variables are set correctly in the `.env` file.
- Verify network configurations and port mappings.
