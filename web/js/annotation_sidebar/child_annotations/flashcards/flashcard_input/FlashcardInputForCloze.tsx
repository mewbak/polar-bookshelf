import * as React from 'react';
import {Logger} from '../../../../logger/Logger';
import Button from 'reactstrap/lib/Button';
import {FlashcardType} from '../../../../metadata/FlashcardType';
import {FlashcardButtons} from './FlashcardButtons';
import {FlashcardTypeSelector} from './FlashcardTypeSelector';
import {RichTextArea} from '../../../RichTextArea';
import {RichTextMutator} from '../../../../apps/card_creator/elements/schemaform/RichTextMutator';
import {Elements} from '../../../../util/Elements';
import {FlashcardInputFieldsType, ClozeFields} from './FlashcardInputTypes';
import {UncontrolledTooltip} from 'reactstrap';
import {Ranges} from '../../../../highlights/text/selection/Ranges';
import {Flashcard} from '../../../../metadata/Flashcard';
import {FlashcardStyles} from './FlashcardStyles';

const log = Logger.create();

export class FlashcardInputForCloze extends React.Component<IProps, IState> {

    private readonly flashcardType: FlashcardType = FlashcardType.CLOZE;

    private fields: ClozeFields = {text: ""};

    private richTextMutator?: RichTextMutator;

    private counter: number = 1;

    constructor(props: IProps, context: any) {
        super(props, context);

        this.onCreate = this.onCreate.bind(this);

        this.state = {
            iter: 0,
        };

    }

    public render() {

        const { id } = this.props;

        return (

            <div id="annotation-flashcard-box" className="">

                <RichTextArea id={`text-${this.props.id}`}
                              autofocus={true}
                              onKeyDown={event => this.onKeyDown(event)}
                              onRichTextMutator={richTextMutator => this.richTextMutator = richTextMutator}
                              onChange={(html) => this.fields.text = html}/>

                {/*- quote annotation ... to copy the annotation text.*/}

                <div style={FlashcardStyles.BottomBar}>

                    <div style={FlashcardStyles.BottomBarItem}>

                        <FlashcardTypeSelector
                            flashcardType={this.flashcardType}
                            onChangeFlashcardType={flashcardType => this.props.onFlashcardChangeType(flashcardType)}/>

                    </div>

                    <div style={FlashcardStyles.BottomBarItem} className="ml-1">

                        <Button id={`button-${this.props.id}`}
                                color="light"
                                size="sm"
                                onClick={() => this.onClozeDelete()}
                                className="ml-1 p-1 border">[…]</Button>

                        <UncontrolledTooltip placement="auto"
                                             delay={{show: 750, hide: 0}}
                                             target={`button-${this.props.id}`}>
                            Create cloze deletion for text <span className="text-muted">Control+Shift+C</span>
                        </UncontrolledTooltip>

                    </div>


                    <div style={FlashcardStyles.BottomBarItemRight}
                         className="text-right">

                        <FlashcardButtons cancelButton={this.props.cancelButton}
                                          onCreate={() => this.onCreate()}/>

                    </div>

                </div>

            </div>

        );

    }

    private onClozeDelete(): void {

        // TODO: don't use the top level window but get it from the proper
        // event
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);

        const textNodes = Ranges.getTextNodes(range);

        if (textNodes.length === 0) {
            return;
        }

        const c = this.counter++;

        const prefix = document.createTextNode(`{{c${c}::`);
        const suffix = document.createTextNode('}}');

        const firstNode = textNodes[0];
        const lastNode = textNodes[textNodes.length - 1];

        firstNode.parentNode!.insertBefore(prefix, firstNode);
        lastNode.parentNode!.insertBefore(suffix, lastNode.nextSibling);

        sel.removeAllRanges();

        this.fields.text = this.richTextMutator!.currentValue();

    }

    private onKeyDown(event: KeyboardEvent) {

        if (this.isKeyboardControlShiftC(event)) {
            this.onClozeDelete();
        }

        if (event.getModifierState("Control") && event.key === "Enter") {
            this.onCreate();
        }

    }

    private isKeyboardControlShiftC(event: KeyboardEvent) {

        return event.getModifierState("Control") &&
               event.getModifierState("Shift") &&
               event.key === "C";
    }

    private onCreate(): void {

        if (this.props.onFlashcard) {
            this.props.onFlashcard(this.flashcardType, this.fields);
        }

        // this.reset();

        this.setState({
            iter: this.state.iter + 1
        });

    }
    //
    // private onCancel(): void {
    //
    //     if (this.props.onCancel) {
    //         this.props.onCancel();
    //     }
    //
    //     this.reset();
    //
    // }
    //
    // private reset(): void {
    //     this.fields = {text: ""};
    // }


}

export interface IProps {

    readonly id: string;

    readonly onFlashcard: (flashcardType: FlashcardType, fields: Readonly<FlashcardInputFieldsType>) => void;

    readonly onFlashcardChangeType: (flashcardType: FlashcardType) => void;

    readonly cancelButton: JSX.Element;

}

export interface IState {
    readonly iter: number;
}

