import * as fs from 'fs'
import { isSettled, parseApplicationList } from '../src/application.js'

describe('isSettled', () => {
  test('without-status', () => {
    const f = fs.readFileSync(`${__dirname}/fixtures/application-list-without-status.json`).toString()
    const applicationList = parseApplicationList(f)
    expect(isSettled(applicationList)).toBeFalsy()
  })

  test('without-sync-status', () => {
    const f = fs.readFileSync(`${__dirname}/fixtures/application-list-without-sync-status.json`).toString()
    const applicationList = parseApplicationList(f)
    expect(isSettled(applicationList)).toBeFalsy()
  })

  test('healthy', () => {
    const f = fs.readFileSync(`${__dirname}/fixtures/application-list-healthy.json`).toString()
    const applicationList = parseApplicationList(f)
    expect(isSettled(applicationList)).toBeTruthy()
  })
})
