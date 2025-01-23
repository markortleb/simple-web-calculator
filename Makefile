.PHONY: default
default:
	echo "No target specified."

.PHONY: build
build:
	cd bin && bash build_docker.sh

.PHONY: run
run:
	cd bin && bash run_docker.sh

.PHONY: deploy
deploy:
	cd bin && bash deploy_to_gitlab.sh


.PHONY: print
print:
	cd bin && bash print_env.sh

