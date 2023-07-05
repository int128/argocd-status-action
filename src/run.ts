import * as core from '@actions/core'
import * as application from './application'

type Inputs = {
  sha: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  for (;;) {
    const applicationList = await application.findByLabel(`github.sha=${inputs.sha}`)
    for (const app of applicationList.items) {
      core.info(`${app.metadata.name}: ${app.status?.sync?.status ?? '?'}, ${app.status?.health?.status ?? '?'}`)
    }
    if (application.isSettled(applicationList)) {
      return
    }
    await sleep(1000)
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
