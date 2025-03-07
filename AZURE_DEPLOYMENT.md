# Deploying Tabler Dashboard to Azure Static Web Apps

This guide will walk you through the process of deploying your Tabler dashboard to Azure Static Web Apps.

## Prerequisites

1. An Azure account with an active subscription
2. Your Tabler dashboard repository on GitHub
3. GitHub account connected to your Azure account

## Step 1: Create an Azure Static Web App

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Click on "Create a resource"
3. Search for "Static Web App" and select it
4. Click "Create"
5. Fill in the basic details:
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create a new one or select an existing one
   - **Name**: Enter a name for your app (e.g., "tabler-dashboard")
   - **Region**: Select a region close to your users
   - **SKU**: Select the appropriate tier (Free is good for starting)

## Step 2: Configure Deployment Source

1. In the "Deployment details" section:
   - **Deployment source**: GitHub
   - **Organization**: Select your GitHub organization or user account
   - **Repository**: Select "twoway3p/tabler"
   - **Branch**: main

2. In the "Build details" section:
   - **Build Preset**: Custom
   - **App location**: `/preview`
   - **Api location**: Leave empty
   - **Output location**: `dist`

3. Click "Review + create" and then "Create"

## Step 3: Save the Deployment Token

After the resource is created, Azure will generate a GitHub Actions workflow file and add it to your repository. However, you already have a workflow file created in your repository.

1. In the Azure portal, navigate to your new Static Web App resource
2. Go to "Deployment tokens" in the left menu
3. Copy the deployment token

## Step 4: Add the Deployment Token as a Secret in GitHub

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token you copied
6. Click "Add secret"

## Step 5: Push to GitHub to Trigger Deployment

The workflow we created is configured to run whenever you push to the main branch. To trigger the deployment:

1. Make a small change to your repository (or create an empty commit)
2. Push to the main branch

```bash
git commit --allow-empty -m "Trigger Azure Static Web Apps deployment"
git push origin main
```

## Step 6: Monitor Deployment

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see the workflow running

Once the workflow completes successfully, your Tabler dashboard will be deployed to Azure Static Web Apps.

## Accessing Your Deployed Site

1. Go to your Azure Static Web App resource in the Azure Portal
2. On the overview page, you'll find the URL to your deployed site (typically `https://{random-name}.azurestaticapps.net`)

## Troubleshooting

If your deployment fails, check the GitHub Actions logs for errors. Common issues include:

- **Build failures**: Make sure all dependencies are properly installed
- **Missing deployment token**: Ensure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set in your GitHub repository
- **Path configuration issues**: Double-check the app_location and output_location settings in the workflow file

## Custom Domain Setup (Optional)

To use a custom domain with your Static Web App:

1. In the Azure Portal, go to your Static Web App resource
2. Select "Custom domains" from the left menu
3. Click "Add" and follow the instructions to add your custom domain

## Next Steps

- Set up continuous integration to automatically deploy changes
- Configure authentication if your app requires it
- Monitor your application's performance using Azure Monitor 