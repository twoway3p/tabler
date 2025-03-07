#!/usr/bin/env node

/**
 * Azure Deployment Script
 * 
 * This script helps deploy the application to Azure
 * It requires the Azure CLI to be installed and you to be logged in
 * 
 * Usage:
 * 1. Make sure you're logged in to Azure CLI: az login
 * 2. Run this script: node deploy-azure.js
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let config = {
  // Resource Group
  resourceGroup: '',
  location: '',
  
  // SQL Server
  sqlServerName: '',
  sqlAdminUser: '',
  sqlAdminPassword: '',
  sqlDatabaseName: '',
  
  // Web App
  appServicePlan: '',
  webAppName: '',
  nodejsVersion: '~18'
};

// Execute command with real-time output
function executeCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, { stdio: 'inherit' });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Check if Azure CLI is installed
async function checkAzureCLI() {
  try {
    await executeCommand('az', ['--version']);
    return true;
  } catch (error) {
    console.error('Azure CLI is not installed or not in PATH');
    console.error('Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli');
    return false;
  }
}

// Check if logged in to Azure
async function checkAzureLogin() {
  try {
    await executeCommand('az', ['account', 'show']);
    return true;
  } catch (error) {
    console.error('Not logged in to Azure CLI');
    console.error('Please login using: az login');
    return false;
  }
}

// Ask for configuration
function askQuestions() {
  return new Promise((resolve) => {
    // Ask for Resource Group
    rl.question('Resource Group Name: ', (resourceGroup) => {
      config.resourceGroup = resourceGroup;
      
      rl.question('Location (e.g., eastus): ', (location) => {
        config.location = location;
        
        // Ask for SQL Server
        rl.question('SQL Server Name: ', (sqlServerName) => {
          config.sqlServerName = sqlServerName;
          
          rl.question('SQL Admin Username: ', (sqlAdminUser) => {
            config.sqlAdminUser = sqlAdminUser;
            
            rl.question('SQL Admin Password: ', (sqlAdminPassword) => {
              config.sqlAdminPassword = sqlAdminPassword;
              
              rl.question('SQL Database Name: ', (sqlDatabaseName) => {
                config.sqlDatabaseName = sqlDatabaseName;
                
                // Ask for Web App
                rl.question('App Service Plan Name: ', (appServicePlan) => {
                  config.appServicePlan = appServicePlan;
                  
                  rl.question('Web App Name: ', (webAppName) => {
                    config.webAppName = webAppName;
                    
                    rl.close();
                    resolve();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Create Resource Group
async function createResourceGroup() {
  console.log(`\nCreating Resource Group: ${config.resourceGroup}`);
  await executeCommand('az', [
    'group', 'create',
    '--name', config.resourceGroup,
    '--location', config.location
  ]);
}

// Create SQL Server
async function createSQLServer() {
  console.log(`\nCreating SQL Server: ${config.sqlServerName}`);
  await executeCommand('az', [
    'sql', 'server', 'create',
    '--name', config.sqlServerName,
    '--resource-group', config.resourceGroup,
    '--location', config.location,
    '--admin-user', config.sqlAdminUser,
    '--admin-password', config.sqlAdminPassword
  ]);
  
  // Configure firewall to allow Azure services
  console.log('\nConfiguring SQL Server firewall...');
  await executeCommand('az', [
    'sql', 'server', 'firewall-rule', 'create',
    '--name', 'AllowAzureServices',
    '--server', config.sqlServerName,
    '--resource-group', config.resourceGroup,
    '--start-ip-address', '0.0.0.0',
    '--end-ip-address', '0.0.0.0'
  ]);
}

// Create SQL Database
async function createSQLDatabase() {
  console.log(`\nCreating SQL Database: ${config.sqlDatabaseName}`);
  await executeCommand('az', [
    'sql', 'db', 'create',
    '--name', config.sqlDatabaseName,
    '--server', config.sqlServerName,
    '--resource-group', config.resourceGroup,
    '--service-objective', 'Basic'
  ]);
}

// Create App Service Plan
async function createAppServicePlan() {
  console.log(`\nCreating App Service Plan: ${config.appServicePlan}`);
  await executeCommand('az', [
    'appservice', 'plan', 'create',
    '--name', config.appServicePlan,
    '--resource-group', config.resourceGroup,
    '--sku', 'B1',
    '--is-linux'
  ]);
}

// Create Web App
async function createWebApp() {
  console.log(`\nCreating Web App: ${config.webAppName}`);
  await executeCommand('az', [
    'webapp', 'create',
    '--name', config.webAppName,
    '--resource-group', config.resourceGroup,
    '--plan', config.appServicePlan,
    '--runtime', `NODE|${config.nodejsVersion}`
  ]);
}

// Configure Web App Settings
async function configureWebApp() {
  console.log('\nConfiguring Web App Settings...');
  
  // Get SQL connection string
  console.log('Getting SQL connection string...');
  const connectionString = await executeCommand('az', [
    'sql', 'db', 'show-connection-string',
    '--name', config.sqlDatabaseName,
    '--server', config.sqlServerName,
    '--client', 'node',
    '--output', 'tsv'
  ]);
  
  // Replace placeholders in connection string
  const sqlConnectionString = connectionString
    .replace('<username>', config.sqlAdminUser)
    .replace('<password>', config.sqlAdminPassword);
  
  // Set app settings
  console.log('Setting app configuration...');
  await executeCommand('az', [
    'webapp', 'config', 'appsettings', 'set',
    '--name', config.webAppName,
    '--resource-group', config.resourceGroup,
    '--settings',
    `DB_USER=${config.sqlAdminUser}`,
    `DB_PASSWORD=${config.sqlAdminPassword}`,
    `DB_NAME=${config.sqlDatabaseName}`,
    `DB_SERVER=${config.sqlServerName}.database.windows.net`
  ]);
}

// Deploy code to Web App
async function deployCode() {
  console.log('\nDeploying code to Web App...');
  // Create a zip file of the application
  await executeCommand('zip', ['-r', 'deploy.zip', '.', '-x', '*node_modules*', '*.git*']);
  
  // Deploy the zip file
  await executeCommand('az', [
    'webapp', 'deployment', 'source', 'config-zip',
    '--name', config.webAppName,
    '--resource-group', config.resourceGroup,
    '--src', 'deploy.zip'
  ]);
  
  // Clean up
  await executeCommand('rm', ['deploy.zip']);
}

// Run database schema script
async function runDatabaseSchema() {
  console.log('\nRunning database schema script...');
  
  // For this step, you would typically use a database migration tool or connect to the database and run the script
  console.log('This step needs to be done manually. Please use the schema.sql file to set up the database.');
}

// Main deployment function
async function deploy() {
  console.log('=== Azure Deployment Script ===');
  
  // Check prerequisites
  const hasAzureCLI = await checkAzureCLI();
  if (!hasAzureCLI) return;
  
  const isLoggedIn = await checkAzureLogin();
  if (!isLoggedIn) return;
  
  // Get configuration
  await askQuestions();
  
  try {
    // Create Azure resources
    await createResourceGroup();
    await createSQLServer();
    await createSQLDatabase();
    await createAppServicePlan();
    await createWebApp();
    await configureWebApp();
    
    // Deploy code
    await deployCode();
    
    // Final steps
    console.log('\n=== Deployment Complete ===');
    console.log(`Web App URL: https://${config.webAppName}.azurewebsites.net`);
    console.log(`API Test Page: https://${config.webAppName}.azurewebsites.net/api-test`);
    
    // Reminder about database schema
    console.log('\nImportant: You need to run the database schema script manually.');
    console.log('You can use the schema.sql file with a tool like Azure Data Studio or the Azure Portal Query Editor.');
    
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

// Start deployment
deploy(); 