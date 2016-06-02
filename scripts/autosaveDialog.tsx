import TFS_Core_Client = require("TFS/Core/RestClient");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import TFS_WorkItemTracking_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_WorkItemTracking_Contracts = require("TFS/WorkItemTracking/Contracts");
import TFS_WorkItemTracking_ExtensionContracts = require("TFS/WorkItemTracking/ExtensionContracts");
import TFS_WorkItemTracking_Services = require("TFS/WorkItemTracking/Services");
import VSS_Utils_Core = require("VSS/Utils/Core");
import VSS_Controls_Combos = require("VSS/Controls/Combos");
import Q = require("q");
import * as React from "react";
import * as ReactDOM from "react-dom";
import {TeamProjectReference} from "TFS/Core/Contracts";
import {WorkItemType} from "TFS/WorkItemTracking/Contracts";
import {WorkItemTypeDropDown} from "scripts/workItemTypeDropDown";
import {ProjectDropdown} from "scripts/projectDropDown";

interface IAutosaveDialogProps {

}

interface IAutosaveDialogState {
    projects: TeamProjectReference[];
    selectedProject: string;
    workItemTypes: WorkItemType[];
    selectedWorkItemType: string;
}

class AutosaveDialog extends React.Component<IAutosaveDialogProps, IAutosaveDialogState> {
    private _coreClient = TFS_Core_Client.getClient();
    private _witClient = TFS_WorkItemTracking_Client.getClient();
    private _projectTypeMapping: IDictionaryStringTo<WorkItemType[]>;

    constructor(props: IAutosaveDialogProps) {
        super(props);

        this._projectTypeMapping = {};

        this.state = {
            projects: [],
            selectedProject: "",
            workItemTypes: [],
            selectedWorkItemType: ""
        };
    }

    componentDidMount() {
        // get the projects
        this._coreClient.getProjects().then((projects) => {
            this.setState({
                projects: projects,
                selectedProject: "",
                workItemTypes: [],
                selectedWorkItemType: ""
            });
        });
    }

    render() {
        return <div>
            <ProjectDropdown selectedProject={this.state.selectedProject} projects={this.state.projects} projectChanged={this._projectChanged.bind(this) } />
            <WorkItemTypeDropDown selectedWorkItemType={this.state.selectedWorkItemType} workItemTypes={this.state.workItemTypes} workItemTypeChanged={this._workItemTypeChanged.bind(this) } />
        </div>;
    }

    private _projectChanged(e: React.FormEvent) {
        let select = e.target as HTMLSelectElement;
        let projectId = select.options[select.selectedIndex].getAttribute("value");
        
        this.state.selectedProject = projectId;
        this.state.selectedWorkItemType = "";
        this.state.workItemTypes = [];

        let resolve = () => {
            this.state.workItemTypes = this._projectTypeMapping[projectId];
            this.setState(this.state);
        };

        if (this._projectTypeMapping[projectId]) {
            resolve();
        }
        else {
            // setting state to the empty values while we wait for the promise.
            this.setState(this.state);
            this._witClient.getWorkItemTypes(projectId).then((types) => {
                this._projectTypeMapping[projectId] = types;
                resolve();
            });
        }
    }

    private _workItemTypeChanged(e: React.FormEvent) {
        let select = e.target as HTMLSelectElement;
        let workItemType = select.options[select.selectedIndex].getAttribute("value");
        
        this.state.selectedWorkItemType = workItemType;
        this.setState(this.state);
    }
}

ReactDOM.render(<AutosaveDialog />, document.getElementById("content"));
/*document.projectSettings["VSO"].
        // Document does not exist, create it.
        var document: AutosaveSettings = {
            id: this._documentId,
            projectSettings: {
                "VSOnline": {
                    typeSettings: {
                        "Bug": {
                            enabled: true,
                            excludedFields: []
                        }
                    }
                }
            },
            delay: this._delayMs
        };*/
        /*
        dataService.setDocument(
            this._documentCollection,
            document,
            this._documentOptions).then((document: AutosaveSettings) => {
                this._autosaveSettings = document;
                deferred.resolve(null);
            }, (reason: any) => {
                debugger;
            });
            
        var coreClient = TFS_Core_Client.getClient();
        var witClient = TFS_WorkItemTracking_Client.getClient();
        this._workItemFormService.getFieldValues(["System.TeamProject", "System.WorkItemType"])
            .then((values: IDictionaryStringTo<Object>) => {
                coreClient.getProject(values["System.TeamProject"] as string).then((project: TFS_Core_Contracts.TeamProject) => {
                    var projectId = project.id;
                    witClient.getWorkItemTypes(projectId).then((types: TFS_WorkItemTracking_Contracts.WorkItemType[]) => {
                        //autosaveDialog.show();

                    });

                }, (reason: any) => {

                })
            });
*/
