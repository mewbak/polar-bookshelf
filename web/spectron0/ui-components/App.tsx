import * as React from 'react';
import {Tags} from 'polar-shared/src/tags/Tags';
import {Group} from "../../js/datastore/sharing/db/Groups";
import {ISODateTimeStrings} from "polar-shared/src/metadata/ISODateTimeStrings";
import {TasksCalculator} from "polar-spaced-repetition/src/spaced_repetition/scheduler/S2Plus/TasksCalculator";
import {Lorems} from "polar-shared/src/util/Lorems";
import {Task} from "polar-spaced-repetition-api/src/scheduler/S2Plus/S2Plus";
import {FontAwesomeIcon} from "../../js/ui/fontawesome/FontAwesomeIcon";
import {Link} from "react-router-dom";
import {Lightbox} from "../../js/ui/util/Lightbox";
import {Dialogs} from "../../js/ui/dialogs/Dialogs";
import {NULL_FUNCTION} from "polar-shared/src/util/Functions";
import {ActionButton} from "../../js/ui/mobile/ActionButton";
import {
    HolidayPromotionButton,
    HolidayPromotionCopy
} from "../../../apps/repository/js/repo_header/HolidayPromotionButton";
import {AccountControlBar} from "../../js/ui/cloud_auth/AccountControlBar";
import {UserInfo} from "../../js/apps/repository/auth_handler/AuthHandler";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {ReactRouters} from "../../js/ui/ReactRouters";
import {AccountOverview} from "../../../apps/repository/js/account_overview/AccountOverview";
import milliseconds from "mocha/lib/ms";
import {DockLayout, DockPanel} from "../../js/ui/doc_layout/DockLayout";
import {ReviewFinished} from "../../../apps/repository/js/reviewer/ReviewFinished";
import {BottomSheet} from "../../js/ui/mobile/BottomSheet";
import {useSpring, animated} from "react-spring";
import {LeftSidebar, LeftSidebars} from "../../js/ui/spring/LeftSidebar";
import {FadeIn} from "../../js/ui/spring/FadeIn";
import {SlideFromBottom} from "../../js/ui/spring/SlideFromBottom";

const styles = {
    swatch: {
        width: '30px',
        height: '30px',
        float: 'left',
        borderRadius: '4px',
        margin: '0 6px 6px 0',
    }
};

const Folders = () => {
    return <div style={{backgroundColor: 'red', overflow: 'auto'}}>
        these are the folders
    </div>;
};

const Preview = () => {
    return <div style={{backgroundColor: 'orange', overflow: 'auto'}}>
        This is the preview
    </div>;
};


const Main = () => {
    return <div style={{backgroundColor: 'blue'}}>this is the right</div>;
};

export class App<P> extends React.Component<{}, IAppState> {

    constructor(props: P, context: any) {
        super(props, context);

    }

    public render() {

        const dockPanels: ReadonlyArray<DockPanel> = [
            {
                id: "left-sidebar",
                type: 'fixed',
                component: <div>left</div>,
                width: 350
            },
            {
                id: "main",
                type: 'grow',
                component: <div>main</div>,
                grow: 1
            },
            {
                id: "right-sidebar",
                type: 'fixed',
                component: <div>right</div>,
                width: 350
            }

        ];

        const MyAnimatedComponent = () => {

            const props = useSpring({
                opacity: 1,
                from: { opacity: 0 },
            });

            return <animated.h1 style={props}>hello</animated.h1>;

        };

        // const LeftSidebar = () => (
        //     <div style={{
        //              position: 'absolute',
        //              left: 0,
        //              top: 0,
        //              width: '350px',
        //              height: '100%',
        //              backgroundColor: 'orange'
        //          }}>
        //
        //     </div>
        // )

        // const LeftSidebar = (props: any) => {
        //
        //     const style = useSpring({
        //         position: 'absolute',
        //         left: 0,
        //         top: 0,
        //         width: '350px',
        //         height: '100%',
        //         from: {
        //             transform: 'translateX(-100%)'
        //         },
        //         to: {
        //             transform: 'translateX(0%)'
        //         }
        //     });
        //
        //     return <animated.div style={style}>
        //         {props.children}
        //     </animated.div>;
        //
        // };

        // const [sidebar, toggleSidebar] = LeftSidebars.create({
        //     style: {
        //         backgroundColor: 'red',
        //     },
        //     children: <div>this is the sidebar</div>
        //
        // });

        // return (
        //
        //     <div>
        //         <SlideFromBottom>
        //             this is the fade in
        //         </SlideFromBottom>
        //     </div>
        //
        // );

        return (
            <BottomSheet>
                01. this is the bottom sheet<br/>
                02. this is the bottom sheet<br/>
                03. this is the bottom sheet<br/>
                04. this is the bottom sheet<br/>
                05. this is the bottom sheet<br/>
                06. this is the bottom sheet<br/>
                07. this is the bottom sheet<br/>
                08. this is the bottom sheet<br/>
                09. this is the bottom sheet<br/>
            </BottomSheet>
        );

        // return (
        //     // <DockLayout dockPanels={dockPanels}/>
        //
        //     // <ReviewFinished/>
        //     //
        //     // <BottomSheet>
        //     //     asdfasfd
        //     // </BottomSheet>
        //
        //
        // );

    }


}

interface IAppState {

}


