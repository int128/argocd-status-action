import * as fs from 'fs'
import { isSettled, parseApplicationList } from '../src/application'

test('application-list-without-status.json', () => {
  const f = fs.readFileSync(`${__dirname}/fixtures/application-list-without-status.json`).toString()
  const applicationList = parseApplicationList(f)
  expect(isSettled(applicationList)).toBeFalsy()
})
