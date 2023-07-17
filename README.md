# argocd-status-action [![ts](https://github.com/int128/argocd-status-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/argocd-status-action/actions/workflows/ts.yaml)

## Getting Started

To run this action, create a workflow as follows:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: int128/argocd-status-action@v1
```

### Inputs

| Name | Default | Description
|------|----------|------------
| `sha` | (required) | example input

### Outputs

None.
