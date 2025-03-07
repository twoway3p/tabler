# Tabler Dashboard Backend Server

This is the Node.js backend server for the Tabler dashboard. It provides API endpoints and connects to an Azure SQL database.

## Local Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3002
   DB_USER=your_sql_username
   DB_PASSWORD=your_sql_password
   DB_NAME=your_database_name
   DB_SERVER=your_sql_server_name.database.windows.net
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. The server will be available at http://localhost:3002

5. Access the API test page at http://localhost:3002/api-test

## Database Setup

The database schema is defined in `database/schema.sql`. You need to run this schema on your Azure SQL Database to create the necessary tables.

### Local Database Testing

For local testing, you can either:

1. Connect to a real Azure SQL Database
2. Use a local SQL Server setup (requires changing the connection options in `database/db.js` to set `trustServerCertificate: true`)

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Deploying to Azure

### Prerequisites

- Azure CLI installed
- Azure account with active subscription
- Logged in to Azure CLI (`az login`)

### Automatic Deployment

1. Run the deployment script:
   ```bash
   node deploy-azure.js
   ```

2. Follow the prompts to provide:
   - Resource group name
   - Location
   - SQL Server name
   - SQL admin username and password
   - SQL database name
   - App Service plan name
   - Web app name

3. The script will:
   - Create a resource group
   - Create an Azure SQL Server and database
   - Create an App Service plan
   - Create a Web App
   - Configure app settings
   - Deploy the code
   
4. After deployment, you'll need to manually run the database schema script in your Azure SQL Database.

### Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Create an Azure SQL Database
2. Create an Azure App Service (Web App)
3. Configure the App Service with environment variables:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SERVER`
4. Deploy the code to the App Service
5. Run the database schema script on your SQL Database

## Security Notes

- In a production environment, you should implement proper authentication and authorization
- Secure the API endpoints with mechanisms like JWT authentication
- Use Azure Key Vault to store secrets instead of environment variables
- Configure additional firewall rules for your SQL Server 