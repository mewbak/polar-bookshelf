import {app} from 'electron';
import {Logger} from './web/js/logger/Logger';
import {MainApp} from './web/js/apps/main/MainApp';
import {ElectronLoggers} from './web/js/logger/ElectronLogger';
import {Datastore} from './web/js/datastore/Datastore';
import {MemoryDatastore} from './web/js/datastore/MemoryDatastore';
import {DiskDatastore} from './web/js/datastore/DiskDatastore';

const log = Logger.create();

let hasSingleInstanceLock = app.requestSingleInstanceLock();

if( ! hasSingleInstanceLock) {
    log.info("Quiting.  App is single instance.");
    app.quit();
}

/**
 * Process app command line args and return an object to work with them
 * directly.
 */
function parseArgs() {

    // TODO: these are mostly disabled for now.  Need to rework these.

    return {

        enableConsoleLogging: process.argv.includes("--enable-console-logging"),

        enableRemoteDebugging: process.argv.includes("--enable-remote-debugging"),
        enableDevTools: process.argv.includes("--enable-dev-tools"),

        // use this option to write to the MEMORY datastore. not the disk
        // datastore.. This way we can test without impacting persistence.
        enableMemoryDatastore: process.argv.includes("--enable-memory-datastore")

    };

}

let args = parseArgs();

app.on('ready', async () => {

    let datastore: Datastore;

    if(args.enableMemoryDatastore) {
        datastore = new MemoryDatastore();
    } else {
        datastore = new DiskDatastore();
    }

    await datastore.init();

    Logger.setLoggerDelegate(await ElectronLoggers.create(datastore.logsDir));

    let mainApp = new MainApp(datastore);
    await mainApp.start();

});
