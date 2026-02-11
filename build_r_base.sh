#!/bin/bash
# Rebuild the R Analytics Base Image
echo "🚀 Building R Analytics Base Image..."
docker build -t ghcr.io/ifrspro/ifrs9-iaf/r-analytics-base:latest -f packages/r-analytics/Dockerfile.base packages/r-analytics

echo "✅ Base image built successfully."
echo "🔄 Now rebuilding the application layer..."
docker-compose -f ops/prod/docker-compose.yml up -d --build r-analytics
