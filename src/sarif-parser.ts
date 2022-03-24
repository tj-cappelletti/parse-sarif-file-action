import * as core from '@actions/core';
import * as fs from 'fs';
import {Log, ReportingDescriptor, ToolComponent} from 'sarif'; // eslint-disable-line import/no-unresolved

export class SarifParser {
  readonly sarifLog: Log;

  constructor(sarifFilePath: string) {
    core.debug(`SARIF File Path: ${sarifFilePath}`);
    if (!fs.existsSync(sarifFilePath)) {
      throw new Error('SARIF file does not exist');
    }

    const buffer = fs.readFileSync(sarifFilePath, 'utf-8');
    this.sarifLog = JSON.parse(buffer);
  }

  getMaxProblemSeverity(): string {
    const securitySevarity = this.getMaxSecuritySeverityScore();

    if (securitySevarity >= 9.0) {
      return 'critical';
    } else if (securitySevarity >= 7.0) {
      return 'high';
    } else if (securitySevarity >= 4.0) {
      return 'medium';
    }

    return 'low';
  }

  getMaxSecuritySeverityScore(): number {
    let securitySevarity = 0;

    for (const run of this.sarifLog.runs) {
      if (run.results === null || run.results === undefined) continue;

      for (const result of run.results) {
        const ruleIndex: number = result.rule?.index ?? -1;
        const toolComponentIndex: number = result.rule?.toolComponent?.index ?? -1;

        if (run.tool.extensions === undefined) continue;

        const toolComponent: ToolComponent = run.tool.extensions[toolComponentIndex];

        if (toolComponent.rules === undefined) continue;

        if (toolComponent.rules[ruleIndex].properties === undefined) continue;

        const reportingDescriptor: ReportingDescriptor = toolComponent.rules[ruleIndex];

        if (reportingDescriptor.properties === undefined) continue;

        if (reportingDescriptor.properties['security-severity'] > securitySevarity)
          securitySevarity = +reportingDescriptor.properties['security-severity'];
      }
    }

    return securitySevarity;
  }

  hasErrorAlerts(): boolean {
    return this.hasAlert('error');
  }

  hasWarningAlerts(): boolean {
    return this.hasAlert('warning');
  }

  hasNoteAlerts(): boolean {
    return this.hasAlert('note');
  }

  private hasAlert(level: string): boolean {
    let hasAlert = false;

    core.debug(`Alert level: ${level} ...`);

    for (const run of this.sarifLog.runs) {
      if (run.results === null || run.results === undefined) continue;

      for (const result of run.results) {
        const ruleIndex: number = result.rule?.index ?? -1;
        const toolComponentIndex: number = result.rule?.toolComponent?.index ?? -1;

        if (run.tool.extensions === undefined) continue;

        const toolComponent: ToolComponent = run.tool.extensions[toolComponentIndex];

        if (toolComponent.rules === undefined) continue;

        if (toolComponent.rules[ruleIndex].properties === undefined) continue;

        const reportingDescriptor: ReportingDescriptor = toolComponent.rules[ruleIndex];

        if (reportingDescriptor.defaultConfiguration?.level === level) {
          hasAlert = true;
          break;
        }
      }

      if (hasAlert) break;
    }

    return hasAlert;
  }

  queryLogFile(jmesPathQuery: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const jmespath = require('jmespath');

    core.debug(`Running query ${jmesPathQuery} ...`);
    const result = jmespath.search(this.sarifLog, jmesPathQuery);

    if (result === null || result === undefined) {
      core.debug(`Result of query is ${result} ...`);
      return false;
    }

    return result.length > 0;
  }

  hasResults(): boolean {
    let hasResults = false;

    for (const run of this.sarifLog.runs) {
      if (run.results !== undefined && run.results.length > 0) {
        hasResults = true;
        break;
      }
    }

    return hasResults;
  }
}
