import * as exec from '@actions/exec'

export const isSettled = (applicationList: ApplicationList) =>
  applicationList.items.every((app) => ['Synced'].includes(app.status.sync.status))

export const findByLabel = async (label: string): Promise<ApplicationList> => {
  const { stdout } = await exec.getExecOutput('kubectl', [
    'get',
    'applications',
    '--output=json',
    '--namespace=argocd',
    '-l',
    label,
  ])
  return parseApplicationList(stdout)
}

export const parseApplicationList = (json: string): ApplicationList => {
  const applicationList: unknown = JSON.parse(json)
  if (!isApplicationList(applicationList)) {
    throw new Error(`invalid ApplicationList object: ${json}`)
  }
  return applicationList
}

type ApplicationList = {
  items: Application[]
}

const isApplicationList = (x: unknown): x is ApplicationList => Array.isArray(x) && x.every((e) => isApplication(e))

type Application = {
  metadata: ApplicationMetadata
  status: ApplicationStatus
}

const isApplication = (x: unknown): x is Application =>
  typeof x === 'object' &&
  x != null &&
  'metadata' in x &&
  isApplicationMetadata(x.metadata) &&
  'status' in x &&
  isApplicationStatus(x.status)

type ApplicationMetadata = {
  name: string
}

const isApplicationMetadata = (x: unknown): x is ApplicationMetadata =>
  typeof x === 'object' && x != null && 'name' in x && typeof x.name === 'string'

type ApplicationStatus = {
  sync: {
    revision: string
    status: string
  }
  health: {
    status: string
  }
}

const isApplicationStatus = (x: unknown): x is ApplicationStatus =>
  typeof x === 'object' &&
  x != null &&
  'sync' in x &&
  typeof x.sync === 'object' &&
  'health' in x &&
  typeof x.health === 'object'
