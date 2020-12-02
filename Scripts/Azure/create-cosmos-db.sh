#!/usr/bin/env bash

#Import configuration
. "./config.cfg"

echo "Creating account for CosmosDb..."
az cosmosdb create \
    --subscription $subscriptionId \
    --resource-group $resourceGroupName \
    --name $databaseAccountName \
    --kind GlobalDocumentDB \
    --locations regionName="Norway East" failoverPriority=0 \
    --default-consistency-level "Session" \
    --verbose

echo "Creating an SQL database..."
az cosmosdb sql database create \
    --subscription $subscriptionId \
    --resource-group $resourceGroupName \
    --account-name $databaseAccountName \
    --name $databaseName \
    --throughput 400 \
    --verbose

