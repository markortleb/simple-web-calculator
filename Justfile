

up-local:
	bash deploy/scripts/stand_up_local.sh

down-local:
	bash deploy/scripts/stand_down_local.sh

up-prod:
	bash deploy/scripts/stand_up_prod.sh

down-prod:
	bash deploy/scripts/stand_down_prod.sh

build-image:
	bash -lc 'source deploy/scripts/import_env.sh && docker build -t "$REGISTRY_DOMAIN/$DOCKER_GROUP_NAME/$DOCKER_PROJECT_NAME:latest" .'

push-image:
	bash -lc 'source deploy/scripts/import_env.sh && echo "$DOCKER_PASSWORD" | docker login "$REGISTRY_DOMAIN" -u "$DOCKER_USER" --password-stdin && docker push "$REGISTRY_DOMAIN/$DOCKER_GROUP_NAME/$DOCKER_PROJECT_NAME:latest"'

build-and-push: build-image push-image

build-and-push-multiarch:
	bash -lc 'source deploy/scripts/import_env.sh && echo "$DOCKER_PASSWORD" | docker login "$REGISTRY_DOMAIN" -u "$DOCKER_USER" --password-stdin && docker buildx build --platform linux/amd64,linux/arm64 -t "$REGISTRY_DOMAIN/$DOCKER_GROUP_NAME/$DOCKER_PROJECT_NAME:latest" --push .'

dev:
	bash -lc 'source deploy/scripts/import_env.sh && LOCAL_TEST_PORT="${LOCAL_TEST_PORT:-4173}" && cd src && python3 -m http.server "${LOCAL_TEST_PORT}"'

docker-run-local:
	bash -lc 'source deploy/scripts/import_env.sh && LOCAL_DOCKER_PORT="${LOCAL_DOCKER_PORT:-8081}" && docker run --rm -p "${LOCAL_DOCKER_PORT}:80" "$REGISTRY_DOMAIN/$DOCKER_GROUP_NAME/$DOCKER_PROJECT_NAME:latest"'

port-forward-local:
	bash -lc 'source deploy/scripts/import_env.sh && PF_PORT="${PF_PORT:-8080}" && KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}" kubectl -n "$DOCKER_PROJECT_NAME" port-forward svc/"$DOCKER_PROJECT_NAME" "$PF_PORT":80'

port-forward-prod:
	bash -lc 'source deploy/scripts/import_env.sh && PF_PORT="${PF_PORT:-8080}" && KUBECONFIG="${KUBECONFIG:-$HOME/.kube/k3s-vps.yaml}" kubectl -n "$DOCKER_PROJECT_NAME" port-forward svc/"$DOCKER_PROJECT_NAME" "$PF_PORT":80'

stop-port-forward-local:
	bash -lc 'source deploy/scripts/import_env.sh && PF_PORT="${PF_PORT:-8080}" && pgrep -f "kubectl.*port-forward.*svc/$DOCKER_PROJECT_NAME.*$PF_PORT:80" | xargs -r kill'

stop-port-forward-prod:
	bash -lc 'source deploy/scripts/import_env.sh && PF_PORT="${PF_PORT:-8080}" && pgrep -f "kubectl.*port-forward.*svc/$DOCKER_PROJECT_NAME.*$PF_PORT:80" | xargs -r kill'
