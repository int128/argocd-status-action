import * as core from '@actions/core'
import * as github from '@actions/github'
import * as application from './application'

type Inputs = {
  sha: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.token)
  let commentId: number | undefined
  for (;;) {
    const applicationList = await application.findByLabel(`github.sha=${inputs.sha}`)
    const summary = formatSummary(applicationList)
    if (commentId === undefined) {
      const { data: comment } = await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: summary,
      })
      commentId = comment.id
      core.info(`created a comment ${comment.html_url}`)
    } else {
      await octokit.rest.issues.updateComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        comment_id: commentId,
        body: summary,
      })
      core.info(`updated the comment of ${commentId}`)
    }
    if (application.isSettled(applicationList)) {
      return
    }
    await sleep(1000)
  }
}

const formatSummary = (applicationList: application.ApplicationList): string => {
  const lines = [`## Argo CD summary`]
  for (const app of applicationList.items) {
    lines.push(`- ${app.metadata.name}: ${app.status?.sync?.status ?? '?'}, ${app.status?.health?.status ?? '?'}`)
  }
  return lines.join('\n')
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
