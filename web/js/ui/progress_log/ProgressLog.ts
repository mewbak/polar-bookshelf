import {Logger} from '../../logger/Logger';
import {Elements} from '../../util/Elements';
import {notNull} from '../../Preconditions';
import {ProgressEvent} from './ProgressEvent';

const log = Logger.create();

/**
 * A ProgressLog keeps allows us to update a log line display and a progress
 * bar while a process is moving forward.  Used via sync, capture, and other
 * future services.
 */
export class ProgressLog {

    constructor() {

    }

    /**
     * Called when we should update the progress of our app as it moves forward
     * and completes work.
     */
    update(progressEvent: ProgressEvent) {

        console.log("Got progress update: ", progressEvent.percentage);

        this.updateProgress(progressEvent);
        this.updateLogView(progressEvent);

    }

    private updateProgress(progressEvent: ProgressEvent) {

        let progressElement = <HTMLProgressElement>document.querySelector("progress");
        progressElement.value = progressEvent.percentage;

    }

    private updateLogView(progressEvent: ProgressEvent) {

        let logElement = notNull(document.querySelector(".log"));

        let lineElement = Elements.createElementHTML(`<div class="">${progressEvent.message}</div>`);

        logElement.appendChild(lineElement);

    }

}

