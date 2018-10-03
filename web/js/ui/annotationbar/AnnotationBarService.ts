import {DocumentLoadedEvent, Model} from '../../model/Model';
import {Logger} from '../../logger/Logger';
import {ControlledPopupProps} from '../popup/ControlledPopup';
import {SimpleReactor} from '../../reactor/SimpleReactor';
import {TriggerPopupEvent} from '../popup/TriggerPopupEvent';
import {CommentPopupBarCallbacks} from '../../comments/react/CommentPopupBar';
import {CommentCreatedEvent} from '../../comments/react/CommentCreatedEvent';
import {CommentPopupBars} from '../../comments/react/CommentPopupBars';
import {AnnotationBarCallbacks, CommentTriggerEvent, OnCommentCallback, OnHighlightedCallback} from './AnnotationBar';
import {HighlightCreatedEvent} from '../../comments/react/HighlightCreatedEvent';
import {AnnotationBars} from './AnnotationBars';
import {TypedMessage} from '../../util/TypedMessage';
import {PopupStateEvent} from '../popup/PopupStateEvent';

const log = Logger.create();

export class AnnotationBarService {

    private model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    public start(): void {
        this.model.registerListenerForDocumentLoaded(event => this.onDocumentLoaded(event));
        document.body.addEventListener('click', event => {

            if (event.target instanceof HTMLElement) {

                const annotationType
                    = event.target.getAttribute('data-annotation-type');

                if (annotationType === 'text-highlight') {

                    console.log("FIXME: 3");

                    // trigger the popup here so we can change the types.

                }

            }

        });

    }

    private onClick() {

    }



    private onDocumentLoaded(event: DocumentLoadedEvent) {
        log.debug("Creating annotation bar");

        const commentBarControlledPopupProps: ControlledPopupProps = {
            id: 'commentbar',
            placement: 'bottom',
            popupStateEventDispatcher: new SimpleReactor<PopupStateEvent>(),
            triggerPopupEventDispatcher: new SimpleReactor<TriggerPopupEvent>()
        };

        const commentPopupBarCallbacks: CommentPopupBarCallbacks = {

            onComment: (commentCreatedEvent: CommentCreatedEvent) => {
                console.log("FIXME: comment created", commentCreatedEvent);
            }

        };

        CommentPopupBars.create(commentBarControlledPopupProps, commentPopupBarCallbacks);

        // FIXME: just tie the visibility of the popup to the visiblity of the
        // region.. when the region vanishes then just close the popup OR the text
        // area is close obviously.

        const popupStateEventDispatcher = new SimpleReactor<PopupStateEvent>();
        const triggerPopupEventDispatcher = new SimpleReactor<TriggerPopupEvent>();

        const annotationBarControlledPopupProps: ControlledPopupProps = {
            id: 'annotationbar',
            placement: 'top',
            popupStateEventDispatcher,
            triggerPopupEventDispatcher
        };

        const onComment: OnCommentCallback =
            (commentTriggerEvent: CommentTriggerEvent) => {

                const activeSelection = commentTriggerEvent.activeSelection;

                commentBarControlledPopupProps.triggerPopupEventDispatcher.dispatchEvent({
                    point: {
                        x: activeSelection.boundingClientRect.left + (activeSelection.boundingClientRect.width / 2),
                        y: activeSelection.boundingClientRect.bottom
                    },
                    offset: {
                        x: 0,
                        y: 10
                    },
                    pageNum: commentTriggerEvent.pageNum,
                    selection: activeSelection.selection,

                });

            };

        const onHighlighted: OnHighlightedCallback = (highlightCreatedEvent: HighlightCreatedEvent) => {

            // TODO: this is just a hack for now.  We should send a dedicated object.
            delete (<any> highlightCreatedEvent).activeSelection;

            const message: TypedMessage<HighlightCreatedEvent> = {
                type: 'create-text-highlight',
                value: highlightCreatedEvent
            };

            window.postMessage(message, '*');

        };

        const annotationBarCallbacks: AnnotationBarCallbacks = {
            onHighlighted,
            onComment
        };

        AnnotationBars.create(annotationBarControlledPopupProps, annotationBarCallbacks, 1);

    }

}
