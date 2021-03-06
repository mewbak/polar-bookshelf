import * as React from 'react';
import {RepoDocMetaLoader} from '../RepoDocMetaLoader';
import {RepoDocMetaManager} from '../RepoDocMetaManager';
import {IDocInfo} from 'polar-shared/src/metadata/IDocInfo';
import {SyncBarProgress} from '../../../../web/js/ui/sync_bar/SyncBar';
import {IEventDispatcher} from '../../../../web/js/reactor/SimpleReactor';
import {PersistenceLayerManager} from '../../../../web/js/datastore/PersistenceLayerManager';
import {RepoHeader} from '../repo_header/RepoHeader';
import {MessageBanner} from '../MessageBanner';
import {FixedNav} from '../FixedNav';
import {AnnotationRepoFilterEngine, UpdatedCallback} from './AnnotationRepoFilterEngine';
import {PersistenceLayerManagers} from '../../../../web/js/datastore/PersistenceLayerManagers';
import {RepoDocMetaLoaders} from '../RepoDocMetaLoaders';
import {AnnotationRepoFiltersHandler} from './AnnotationRepoFiltersHandler';
import ReleasingReactComponent from '../framework/ReleasingReactComponent';
import {Tag, Tags, TagStr} from 'polar-shared/src/tags/Tags';
import {FilteredTags} from '../FilteredTags';
import {TreeState} from "../../../../web/js/ui/tree/TreeState";
import {Row} from "../../../../web/js/ui/layout/Row";
import {DEFAULT_LIMIT, Reviewers} from "../reviewer/Reviewers";
import {TextFilter} from "./filter_bar/TextFilter";
import {HighlightColorFilterButton} from "./filter_bar/controls/color/HighlightColorFilterButton";
import {AnnotationTypeSelector} from "./filter_bar/controls/annotation_type/AnnotationTypeSelector";
import {StartReviewDropdown} from "./filter_bar/StartReviewDropdown";
import {RepetitionMode} from "polar-spaced-repetition-api/src/scheduler/S2Plus/S2Plus";
import {RepoFooter} from "../repo_footer/RepoFooter";
import {IDocAnnotation} from "../../../../web/js/annotation_sidebar/DocAnnotation";
import {AnnotationRepoTableDropdown} from "./AnnotationRepoTableDropdown";
import {FolderSidebar} from "../folders/FolderSidebar";
import {PersistenceLayerProvider} from "../../../../web/js/datastore/PersistenceLayer";
import {TagDescriptor} from "polar-shared/src/tags/TagDescriptors";
import {PersistenceLayerMutator} from "../persistence_layer/PersistenceLayerMutator";
import {BrowserRouter, Link, Route, Switch} from "react-router-dom";
import {ReactRouters} from "../../../../web/js/ui/ReactRouters";
import {DeviceRouter} from "../../../../web/js/ui/DeviceRouter";
import {NavIcon} from '../nav/NavIcon';
import {CloudAuthButton} from "../../../../web/js/ui/cloud_auth/CloudAuthButton";
import {NULL_FUNCTION} from 'polar-shared/src/util/Functions';
import {FloatingActionButton} from "../../../../web/js/ui/mobile/FloatingActionButton";
import {StartReviewBottomSheet} from "../../../../web/js/ui/mobile/StartReviewBottomSheet";
import {IndeterminateLoadingTransition} from "../../../../web/js/ui/mobile/IndeterminateLoadingTransition";
import {DockLayout} from "../../../../web/js/ui/doc_layout/DockLayout";
import {AnnotationListView} from "./AnnotationListView";
import {AnnotationPreviewView} from "./AnnotationPreviewView";

export default class AnnotationRepoScreen extends ReleasingReactComponent<IProps, IState> {

    private readonly treeState: TreeState<TagDescriptor>;

    private readonly filtersHandler: AnnotationRepoFiltersHandler;

    /**
     * The tags that are selected by the user.
     */
    private selectedTags: ReadonlyArray<Tag> = [];

    /**
     * The tags that are selected by the user.
     */
    private selectedFolders: ReadonlyArray<Tag> = [];
    private persistenceLayerMutator: PersistenceLayerMutator;

    constructor(props: IProps, context: any) {
        super(props, context);

        this.onSelectedFolders = this.onSelectedFolders.bind(this);
        this.onUpdatedTags = this.onUpdatedTags.bind(this);
        this.startReview = this.startReview.bind(this);
        this.createReviewer = this.createReviewer.bind(this);

        this.createRouter = this.createRouter.bind(this);

        this.state = {
            data: [],
        };

        const onSelected = (values: ReadonlyArray<TagStr>) => this.onSelectedFolders(values);

        this.treeState = new TreeState(onSelected);

        const setStateInBackground = (state: IState) => {

            setTimeout(() => {

                // The react table will not update when I change the state from
                // within the event listener
                this.setState(state);

            }, 1);

        };

        const onUpdated: UpdatedCallback = repoAnnotations => {
            const state = {...this.state, data: repoAnnotations};
            setStateInBackground(state);
        };

        const repoAnnotationsProvider: () => ReadonlyArray<IDocAnnotation> =
            () => this.props.repoDocMetaManager!.repoDocAnnotationIndex.values();

        const filterEngine = new AnnotationRepoFilterEngine(repoAnnotationsProvider, onUpdated);

        this.filtersHandler = new AnnotationRepoFiltersHandler(filters => filterEngine.onFiltered(filters));

        const doRefresh = () => filterEngine.onProviderUpdated();

        const repoDocInfosProvider = () => this.props.repoDocMetaManager.repoDocInfoIndex.values();

        this.persistenceLayerMutator
            = new PersistenceLayerMutator(this.props.repoDocMetaManager,
                                          this.props.persistenceLayerProvider,
                                          this.props.tags,
                                          repoDocInfosProvider,
                                          () => doRefresh());

        PersistenceLayerManagers.onPersistenceManager(this.props.persistenceLayerManager, (persistenceLayer) => {

            this.releaser.register(
                persistenceLayer.addEventListener(() => doRefresh()));

        });

        this.releaser.register(
            RepoDocMetaLoaders.addThrottlingEventListener(this.props.repoDocMetaLoader, () => doRefresh()));

        // do an initial refresh to get the first batch of data.
        doRefresh();

    }

    public render() {

        const desktop = <AnnotationRepoScreen.Desktop {...this.props}/>;
        const phoneAndTablet = <AnnotationRepoScreen.PhoneAndTablet {...this.props}/>;

        return <DeviceRouter desktop={desktop}
                             phone={phoneAndTablet}
                             tablet={phoneAndTablet}/>;

    }

    private onSelectedFolders(selected: ReadonlyArray<TagStr>) {
        this.selectedFolders = selected.map(current => Tags.create(current));
        this.onUpdatedTags();
    }

    private onUpdatedTags() {

        const tags = [...this.selectedTags, ...this.selectedFolders];

        const filteredTags = new FilteredTags();
        filteredTags.set(tags);

        this.filtersHandler.update({filteredTags});
    }

    private startReview(mode: RepetitionMode = 'reading') {
        const persistenceLayer = this.props.persistenceLayerManager.get();
        const datastoreCapabilities = persistenceLayer.capabilities();
        const prefs = persistenceLayer.datastore.getPrefs();

        Reviewers.start(datastoreCapabilities, prefs.get(), this.state.data, mode, 10);
    }

    private async createReviewer(mode: RepetitionMode = 'reading') {
        const persistenceLayer = this.props.persistenceLayerManager.get();
        const datastoreCapabilities = persistenceLayer.capabilities();
        const prefs = persistenceLayer.datastore.getPrefs();

        return await Reviewers.create(datastoreCapabilities, prefs.get(), this.state.data, mode, NULL_FUNCTION, DEFAULT_LIMIT);
    }

    private createRouter() {
        return (
            <BrowserRouter>

                <Switch location={ReactRouters.createLocationWithPathnameHash()}>

                    <Route path='/annotations#start-review'
                           component={() => <StartReviewBottomSheet onReading={NULL_FUNCTION} onFlashcards={NULL_FUNCTION}/>}/>

                    <Route path='/annotations#review-flashcards'
                           component={() => <IndeterminateLoadingTransition provider={() => this.createReviewer('flashcard')}/>}/>

                    <Route path='/annotations#review-reading'
                           component={() => <IndeterminateLoadingTransition provider={() => this.createReviewer('reading')}/>}/>

                </Switch>

            </BrowserRouter>
        );
    }

    public static PhoneAndTablet = class extends AnnotationRepoScreen {



        public render() {

            const AnnotationsList = () => <AnnotationListView data={this.state.data}
                                                              updateFilters={filters => this.filtersHandler.update(filters)}
                                                              onSelected={repoAnnotation => this.setState({...this.state, repoAnnotation})}
                                                              {...this.props}/>;

            const AnnotationPreview = () => <AnnotationPreviewView persistenceLayerManager={this.props.persistenceLayerManager}
                                                                   repoAnnotation={this.state.repoAnnotation}/>;

            const Phone = () => (
                <DockLayout dockPanels={[
                    {
                        id: 'dock-panel-center',
                        type: 'grow',
                        component: <AnnotationsList/>,
                    },
                ]}/>
            );

            const Tablet = () => (
                <DockLayout dockPanels={[
                    {
                        id: 'dock-panel-center',
                        type: 'fixed',
                        component: <AnnotationsList/>,
                        width: 350
                    },
                    {
                        id: 'dock-panel-right',
                        type: 'grow',
                        component: <AnnotationPreview/>
                    }
                ]}/>
            );

            return (

                <FixedNav id="doc-repository"
                          className="annotations-view">

                    <header>

                        <Row id="header-filter" className="border-bottom p-1 mt-1">

                            <Row.Main>

                                <div style={{display: 'flex'}}>

                                    <div className="mr-1">
                                        <NavIcon/>
                                    </div>

                                    <div className="mr-1 mt-auto mb-auto">
                                        <AnnotationTypeSelector selected={this.filtersHandler.filters.annotationTypes || []}
                                                                onSelected={annotationTypes => this.filtersHandler.update({annotationTypes})}/>
                                    </div>

                                    <div className="mr-1 mt-auto mb-auto">
                                        <HighlightColorFilterButton selected={this.filtersHandler.filters.colors}
                                                                    onSelected={selected => this.filtersHandler.update({colors: selected})}/>
                                    </div>

                                    <div className="ml-1 d-none-mobile mt-auto mb-auto">
                                        <TextFilter updateFilters={filters => this.filtersHandler.update(filters)}/>
                                    </div>

                                    <div className="ml-1 d-none-mobile mt-auto mb-auto">
                                        <AnnotationRepoTableDropdown persistenceLayerProvider={() => this.props.persistenceLayerManager.get()}
                                                                     annotations={this.state.data}/>
                                    </div>

                                </div>

                            </Row.Main>

                            <Row.Right>
                                <CloudAuthButton persistenceLayerController={this.props.persistenceLayerManager} />
                            </Row.Right>

                        </Row>

                    </header>

                    <FixedNav.Body>

                        {this.createRouter()}

                        <Link to={{pathname: '/annotations', hash: '#start-review'}}>
                            <FloatingActionButton style={{
                                                      paddingBottom: '60px',
                                                      paddingRight: '20px'
                                                  }}
                                                  icon="fas fa-graduation-cap"
                                                  onClick={NULL_FUNCTION}/>
                        </Link>


                        <DeviceRouter phone={<Phone/>} tablet={<Tablet/>}/>

                    </FixedNav.Body>

                    <FixedNav.Footer>
                        <RepoFooter/>
                    </FixedNav.Footer>

                </FixedNav>

            );
        }
    };

    public static Desktop = class extends AnnotationRepoScreen {

        public render() {

            return (

                <FixedNav id="doc-repository"
                          className="annotations-view">

                    <header>
                        <RepoHeader persistenceLayerProvider={this.props.persistenceLayerProvider}
                                    persistenceLayerController={this.props.persistenceLayerManager}/>

                        <Row id="header-filter"
                             className="border-bottom p-1">
                            <Row.Main>
                                {/*<StartReviewButton onClick={() => this.startReview('flashcard')}/>*/}
                                <StartReviewDropdown onFlashcards={() => this.startReview('flashcard')}
                                                     onReading={() => this.startReview('reading')}/>
                            </Row.Main>

                            <Row.Right>

                                <div style={{display: 'flex'}}>

                                    <div className="mr-1">
                                        <AnnotationTypeSelector selected={this.filtersHandler.filters.annotationTypes || []}
                                                                onSelected={annotationTypes => this.filtersHandler.update({annotationTypes})}/>
                                    </div>

                                    <div className="mr-1">
                                        <HighlightColorFilterButton selected={this.filtersHandler.filters.colors}
                                                                    onSelected={selected => this.filtersHandler.update({colors: selected})}/>
                                    </div>

                                    <div className="ml-1 d-none-mobile">
                                        <TextFilter updateFilters={filters => this.filtersHandler.update(filters)}/>
                                    </div>

                                    <div className="ml-1 d-none-mobile mt-auto mb-auto">
                                        <AnnotationRepoTableDropdown persistenceLayerProvider={() => this.props.persistenceLayerManager.get()}
                                                                     annotations={this.state.data}/>
                                    </div>

                                </div>

                            </Row.Right>

                        </Row>

                        <MessageBanner/>

                    </header>

                    {this.createRouter()}

                    <DockLayout dockPanels={[
                        {
                            id: 'dock-panel-left',
                            type: 'fixed',
                            component: <FolderSidebar persistenceLayerMutator={this.persistenceLayerMutator}
                                                      treeState={this.treeState}
                                                      tags={this.props.tags()}/>,
                            width: 300
                        },
                        {
                            id: 'dock-panel-center',
                            type: 'fixed',
                            component: <AnnotationListView data={this.state.data}
                                                           updateFilters={filters => this.filtersHandler.update(filters)}
                                                           onSelected={repoAnnotation => this.setState({...this.state, repoAnnotation})}
                                                           {...this.props}/>,
                            width: 450
                        },
                        {
                            id: 'dock-panel-right',
                            type: 'grow',
                            component: <AnnotationPreviewView persistenceLayerManager={this.props.persistenceLayerManager}
                                                              repoAnnotation={this.state.repoAnnotation}/>

                        }
                    ]}/>

                    <RepoFooter/>

                </FixedNav>

            );
        }
    };

}


export interface IProps {

    readonly persistenceLayerManager: PersistenceLayerManager;

    readonly persistenceLayerProvider: PersistenceLayerProvider;

    readonly updatedDocInfoEventDispatcher: IEventDispatcher<IDocInfo>;

    readonly syncBarProgress: IEventDispatcher<SyncBarProgress>;

    readonly repoDocMetaManager: RepoDocMetaManager;

    readonly repoDocMetaLoader: RepoDocMetaLoader;

    readonly tags: () => ReadonlyArray<TagDescriptor>;
}

export interface IState {

    readonly repoAnnotation?: IDocAnnotation;

    readonly data: ReadonlyArray<IDocAnnotation>;

}

