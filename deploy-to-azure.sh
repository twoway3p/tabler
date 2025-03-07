#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tabler Dashboard Azure Deployment Script ===${NC}"
echo

# Check if Azure CLI is installed
if ! command -v az &> /dev/null
then
    echo -e "${RED}Azure CLI is not installed. Please install it first.${NC}"
    echo -e "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo -e "${YELLOW}Logging in to Azure...${NC}"
az login

# Ask for resource group name
echo -e "${YELLOW}Enter a name for the resource group (e.g., tabler-dashboard-rg):${NC}"
read RESOURCE_GROUP

# Ask for location
echo -e "${YELLOW}Enter the location for your resources (e.g., eastus):${NC}"
read LOCATION

# Ask for app name
echo -e "${YELLOW}Enter a name for the Static Web App (e.g., tabler-dashboard):${NC}"
read APP_NAME

# Ask for GitHub repo
echo -e "${YELLOW}Enter your GitHub repository URL (e.g., https://github.com/twoway3p/tabler):${NC}"
read REPO_URL

# Parse GitHub username and repo from URL
GITHUB_USERNAME=$(echo $REPO_URL | sed -n 's/.*github.com\/\([^\/]*\)\/.*/\1/p')
REPO_NAME=$(echo $REPO_URL | sed -n 's/.*github.com\/[^\/]*\/\(.*\)/\1/p')

# Create resource group
echo -e "${GREEN}Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Static Web App
echo -e "${GREEN}Creating Static Web App...${NC}"
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source $REPO_URL \
  --branch main \
  --app-location "/preview" \
  --output-location "dist" \
  --login-with-github

# Get the deployment token
echo -e "${GREEN}Getting deployment token...${NC}"
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

echo
echo -e "${BLUE}=== Deployment Information ===${NC}"
echo
echo -e "${GREEN}Resource Group:${NC} $RESOURCE_GROUP"
echo -e "${GREEN}App Name:${NC} $APP_NAME"
echo -e "${GREEN}Location:${NC} $LOCATION"
echo -e "${GREEN}GitHub Repository:${NC} $REPO_URL"
echo
echo -e "${YELLOW}IMPORTANT: Add the following deployment token as a GitHub secret named AZURE_STATIC_WEB_APPS_API_TOKEN${NC}"
echo
echo -e "${BLUE}$DEPLOYMENT_TOKEN${NC}"
echo
echo -e "${GREEN}Next steps:${NC}"
echo "1. Add the token above as a GitHub secret named AZURE_STATIC_WEB_APPS_API_TOKEN"
echo "2. Push a commit to your main branch to trigger the deployment"
echo "3. Check the GitHub Actions tab in your repository for deployment status"
echo
echo -e "${BLUE}Your Static Web App will be available at: https://$APP_NAME.azurestaticapps.net${NC}" 