import * as core from '@actions/core'
import * as exec from '@actions/exec'
import assert from 'assert'

export const isSettled = (applicationList: ApplicationList) =>
  applicationList.items.every(
    (app) =>
      app.status &&
      app.status.sync &&
      ['Synced'].includes(app.status.sync.status) &&
      app.status.health &&
      ['Healthy'].includes(app.status.health.status)
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
  assert(x != null)
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
    revision: string
    status: string
  }
  health?: {
    status: string
  }
}

function assertIsApplicationStatus(x: unknown): asserts x is ApplicationStatus {
  assert(typeof x === 'object')
  assert(x != null)
  if ('sync' in x) {
    assert(typeof x.sync === 'object')
  }
  if ('health' in x) {
    assert(typeof x.health === 'object')
  }
}
