import * as fs from 'fs'
import { isSettled, parseApplicationList } from '../src/application'

describe('isSettled', () => {
  test('application-list-without-status', () => {
    const f = fs.readFileSync(`${__dirname}/fixtures/application-list-without-status.json`).toString()
    const applicationList = parseApplicationList(f)
    expect(isSettled(applicationList)).toBeFalsy()
  })

  test('application-list-without-sync-status', () => {
    const f = fs.readFileSync(`${__dirname}/fixtures/application-list-without-sync-status.json`).toString()
    const applicationList = parseApplicationList(f)
    expect(isSettled(applicationList)).toBeFalsy()
  })
})
