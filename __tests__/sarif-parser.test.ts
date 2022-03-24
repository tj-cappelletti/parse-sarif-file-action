import * as path from 'path';
import {expect, test} from '@jest/globals';
import {SarifParser} from '../src/sarif-parser';

test('throws file now found', () => {
  const sarifFilePath: string = 'something that does not exist';

  expect(() => {
    new SarifParser(sarifFilePath);
  }).toThrow('SARIF file does not exist');
});

test('Get max problm severity errors', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let problemSeverity = sarifParser.getMaxProblemSeverity();

  expect(problemSeverity).toBe('high');
});

test('Get max problem severity with warnings', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-warning-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let problemSeverity = sarifParser.getMaxProblemSeverity();

  expect(problemSeverity).toBe('medium');
});

test('Get max security severity score with errors', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let securitySevarityScore = sarifParser.getMaxSecuritySeverityScore();

  expect(securitySevarityScore).toBe(7.5);
});

test('Get max security severity score with warnings', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-warning-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let securitySevarityScore = sarifParser.getMaxSecuritySeverityScore();

  expect(securitySevarityScore).toBe(6.1);
});

test('Query SARIF file with results', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');
  const jmesPathQuery: string = 'runs[*].results';

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.queryLogFile(jmesPathQuery);

  expect(anyResults).toBe(true);
});

test('Query SARIF file with empty results', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-without-results.json');
  const jmesPathQuery: string = 'runs[*].results';

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.queryLogFile(jmesPathQuery);

  expect(anyResults).toBe(true);
});

test('SARIF file with results', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasResults();

  expect(anyResults).toBe(true);
});

test('SARIF file without results', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-without-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasResults();

  expect(anyResults).toBe(false);
});

test('SARIF file with errors', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasErrorAlerts();

  expect(anyResults).toBe(true);
});

test('SARIF file without errors', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-warning-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasErrorAlerts();

  expect(anyResults).toBe(false);
});

test('SARIF file with warnings', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-warning-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasWarningAlerts();

  expect(anyResults).toBe(true);
});

test('SARIF file without warnings', () => {
  const sarifFilePath: string = path.join(__dirname, 'sarif-files', 'sarif-with-error-results.json');

  let sarifParser: SarifParser = new SarifParser(sarifFilePath);

  let anyResults = sarifParser.hasWarningAlerts();

  expect(anyResults).toBe(false);
});
