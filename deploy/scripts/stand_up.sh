#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")/.."

source "$SCRIPT_DIR/import_env.sh"

environment="$1"

if [ -z "$environment" ]; then
  echo "Usage: ./install_website.sh [local|prod]"
  exit 1
fi

CHART_DIR="$PROJECT_ROOT/deploy/chart"
NAMESPACE="$DOCKER_PROJECT_NAME"

echo "Creating namespace '$NAMESPACE' (if not exists)..."
kubectl get namespace "$NAMESPACE" >/dev/null 2>&1 || \
  kubectl create namespace "$NAMESPACE"

echo "Recreating registry secret..."
kubectl delete secret my-registry-secret --namespace="$NAMESPACE" --ignore-not-found

kubectl create secret docker-registry my-registry-secret \
  --namespace="$NAMESPACE" \
  --docker-server="$REGISTRY_DOMAIN" \
  --docker-username="$DOCKER_USER" \
  --docker-password="$DOCKER_PASSWORD"


echo "Recreating app secrets..."
kubectl delete secret app-secret --namespace="$NAMESPACE" --ignore-not-found

kubectl create secret generic app-secret \
  --namespace="$NAMESPACE" \
  --from-literal=TELEGRAM_API_ID="$TELEGRAM_API_ID" \
  --from-literal=TELEGRAM_API_HASH="$TELEGRAM_API_HASH"

echo "Running Helm install/upgrade..."

helm upgrade --install "$DOCKER_PROJECT_NAME" "$CHART_DIR" \
  -n "$NAMESPACE" \
  -f "$CHART_DIR/values.yaml" \
  -f "$CHART_DIR/values-${environment}.yaml" \
  --set image.secret=my-registry-secret \
  --set environment="$environment"

echo "Deployment complete in namespace '$NAMESPACE'."