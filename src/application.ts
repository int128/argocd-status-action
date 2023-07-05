import * as core from '@actions/core'
import * as exec from '@actions/exec'
import assert from 'assert'

export const isSettled = (applicationList: ApplicationList) =>
  applicationList.items.every(
    (app) =>
      app.status &&
      app.status.sync &&
      [SyncStatusCode.Synced].includes(app.status.sync.status) &&
      app.status.health &&
      [HealthStatusCode.Healthy, HealthStatusCode.Degraded, HealthStatusCode.Missing].includes(app.status.health.status)
  )

export const findByLabel = async (label: string): Promise<ApplicationList> => {
  const { stdout } = await core.group(`kubectl get applications`, () =>
    exec.getExecOutput('kubectl', ['get', 'applications', '--output=json', '--namespace=argocd', '-l', label])
  )
  return parseApplicationList(stdout)
}

export const parseApplicationList = (json: string): ApplicationList => {
  const applicationList: unknown = JSON.parse(json)
  assertIsApplicationList(applicationList)
  return applicationList
}

type ApplicationList = {
  items: Application[]
}

function assertIsApplicationList(x: unknown): asserts x is ApplicationList {
  assert(typeof x === 'object')
  assert(x != null)
  assert('items' in x)
  assert(Array.isArray(x.items))
  for (const item of x.items) {
    assertIsApplication(item)
  }
}

type Application = {
  metadata: ApplicationMetadata
  status?: ApplicationStatus
}

function assertIsApplication(x: unknown): asserts x is Application {
  assert(typeof x === 'object')
  assert(x !== null)
  assert('metadata' in x)
  assertIsApplicationMetadata(x.metadata)
  if ('status' in x) {
    assertIsApplicationStatus(x.status)
  }
}

type ApplicationMetadata = {
  name: string
}

function assertIsApplicationMetadata(x: unknown): asserts x is ApplicationMetadata {
  assert(typeof x === 'object')
  assert(x != null)
  assert('name' in x)
  assert(typeof x.name === 'string')
}

type ApplicationStatus = {
  sync?: {
    status: SyncStatusCode
  }
  health?: {
    status: HealthStatusCode
  }
}

function assertIsApplicationStatus(x: unknown): asserts x is ApplicationStatus {
  assert(typeof x === 'object')
  assert(x != null)
  if ('sync' in x) {
    assert(typeof x.sync === 'object')
    assert(x.sync !== null)
    assert('status' in x.sync)
    assert(typeof x.sync.status === 'string')
  }
  if ('health' in x) {
    assert(typeof x.health === 'object')
    assert(x.health !== null)
    assert('status' in x.health)
    assert(typeof x.health.status === 'string')
  }
}

//https://github.com/argoproj/argo-cd/blob/v2.7.6/pkg/apis/application/v1alpha1/types.go#L1333
enum SyncStatusCode {
  Unknown = 'Unknown',
  Synced = 'Synced',
  OutOfSync = 'OutOfSync',
}

// https://github.com/argoproj/gitops-engine/blob/v0.7.3/pkg/health/health.go
enum HealthStatusCode {
  Unknown = 'Unknown',
  Progressing = 'Progressing',
  Healthy = 'Healthy',
  Suspended = 'Suspended',
  Degraded = 'Degraded',
  Missing = 'Missing',
}
