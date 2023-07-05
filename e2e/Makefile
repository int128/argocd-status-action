CLUSTER_NAME := argocd-status-action-e2e
KUBECONFIG := output/kubeconfig.yaml
export KUBECONFIG

GITHUB_RUN_NUMBER ?= 0
FIXTURE_BASE_BRANCH := e2e-test/$(GITHUB_RUN_NUMBER)
FIXTURE_DIR := fixture-checkout

all:

# cluster
cluster: $(KUBECONFIG)
$(KUBECONFIG):
	kind create cluster --name $(CLUSTER_NAME)

set-github-env-kubeconfig:
	echo "KUBECONFIG=$(abspath $(KUBECONFIG))" >> "$(GITHUB_ENV)"

delete-cluster:
	kind delete cluster --name $(CLUSTER_NAME)
	-rm $(KUBECONFIG)

deploy-argocd: cluster
	kustomize build argocd | kubectl apply -f -
	kustomize build applications | sed -e "s|FIXTURE_BASE_BRANCH|$(FIXTURE_BASE_BRANCH)|g" | kubectl apply -f -
	kubectl -n argocd label application app1 'github.sha=$(GITHUB_SHA)'
	kubectl -n argocd label application app2 'github.sha=$(GITHUB_SHA)'
	kubectl -n argocd label application app3 'github.sha=$(GITHUB_SHA)'

# fixture
setup-fixture-branch:
	test -d $(FIXTURE_DIR)
	rsync -av fixture/ $(FIXTURE_DIR)/
	$(MAKE) -C $(FIXTURE_DIR) push-base-branch

delete-fixture-branch:
	$(MAKE) -C $(FIXTURE_DIR) delete-base-branch

deploy-app1:
	$(MAKE) -C $(FIXTURE_DIR) update-manifest-app1
	kubectl -n argocd -oyaml get applications

deploy-app2:
	$(MAKE) -C $(FIXTURE_DIR) update-manifest-app2
	kubectl -n argocd -oyaml get applications

deploy-app3:
	$(MAKE) -C $(FIXTURE_DIR) update-manifest-app3
	kubectl -n argocd -oyaml get applications

logs-argocd:
	-kubectl -n argocd -oyaml get applications
	-kubectl -n argocd logs -l app.kubernetes.io/name=argocd-application-controller --all-containers --tail=-1
