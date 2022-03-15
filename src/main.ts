import * as core from '@actions/core'
import { SarifParser } from './sarif-parser'

function failWorkFlow() {

}

async function run(): Promise<void> {
  try {
    const failOnAnyString: string = core.getInput('failOnAny');
    const failOnErrorsString: string = core.getInput('failOnErrors');
    const failOnWarningsString: string = core.getInput('failOnWarnings');
    const failOnNotesString: string = core.getInput('failOnNotes');
    const jmesPathQuery: string = core.getInput('jmesPathQuery');
    const sarifFilePath: string = core.getInput('sarifFile');

    core.debug(`failOnAny: ${failOnAnyString}`);
    core.debug(`failOnErrors: ${failOnErrorsString}`);
    core.debug(`failOnWarnings: ${failOnWarningsString}`);
    core.debug(`jmesPathQuery: ${jmesPathQuery}`);
    core.debug(`sarifFilePath: ${sarifFilePath}`);

    // Ensure parmeters can be parsed
    if (failOnAnyString === undefined) throw new Error("The value for `failOnAny` must be defined");
    if (failOnErrorsString === undefined) throw new Error("The value for `failOnErrors` must be defined");
    if (failOnWarningsString === undefined) throw new Error("The value for `failOnWarnings` must be defined");
    if (failOnNotesString === undefined) throw new Error("The value for `failOnNotes` must be defined");

    // Ensure parmeters have the right value
    if (failOnAnyString.toLocaleLowerCase() !== "false" && failOnAnyString.toLocaleLowerCase() !== "true") throw new Error(`Unable to parse the value '${failOnAnyString}' as a boolean for 'failOnAny'`)
    if (failOnErrorsString.toLocaleLowerCase() !== "false" && failOnErrorsString.toLocaleLowerCase() !== "true") throw new Error(`Unable to parse the value '${failOnErrorsString}' as a boolean for 'failOnErrorsString'`)
    if (failOnWarningsString.toLocaleLowerCase() !== "false" && failOnWarningsString.toLocaleLowerCase() !== "true") throw new Error(`Unable to parse the value '${failOnWarningsString}' as a boolean for 'failOnWarningsString'`)
    if (failOnNotesString.toLocaleLowerCase() !== "false" && failOnNotesString.toLocaleLowerCase() !== "true") throw new Error(`Unable to parse the value '${failOnNotesString}' as a boolean for 'failOnNotesString'`)

    let failOnAny: boolean = failOnAnyString.toLocaleLowerCase() === "true";
    let failOnErrors: boolean = failOnErrorsString.toLocaleLowerCase() === "true";
    let failOnWarnings: boolean = failOnWarningsString.toLocaleLowerCase() === "true";
    let failOnNotes: boolean = failOnNotesString.toLocaleLowerCase() === "true";

    let sarifParser: SarifParser = new SarifParser(sarifFilePath);

    let errorsDetected: boolean = await sarifParser.hasErrorAlerts();
    let warningsDetected: boolean = await sarifParser.hasWarningAlerts();
    let notesDetected: boolean = await sarifParser.hasNoteAlerts();

    core.debug(`errorsDetected: ${errorsDetected}`);
    core.debug(`warningsDetected: ${warningsDetected}`)
    core.debug(`notesDetected: ${notesDetected}`)

    if ((failOnAny && (errorsDetected || warningsDetected || notesDetected)) ||
      (failOnErrors && errorsDetected) ||
      (failOnWarnings && warningsDetected) ||
      (failOnNotes && notesDetected)) {
      failWorkFlow();
    }

    if (jmesPathQuery === undefined || jmesPathQuery.length === 0) return;

    let queryHasResults: boolean = await sarifParser.queryLogFile(jmesPathQuery);

    core.debug(`queryHasResults: ${queryHasResults}`)

    if (queryHasResults) failWorkFlow();

    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    let message: string = "An unknown error occured.";

    if (error instanceof Error) message = error.message;

    core.setFailed(message);
  }
}

run()
