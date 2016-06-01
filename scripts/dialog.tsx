import TFS_Core_Client = require("TFS/Core/RestClient");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import TFS_WorkItemTracking_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_WorkItemTracking_Contracts = require("TFS/WorkItemTracking/Contracts");
import TFS_WorkItemTracking_ExtensionContracts = require("TFS/WorkItemTracking/ExtensionContracts");
import TFS_WorkItemTracking_Services = require("TFS/WorkItemTracking/Services");
import VSS_Utils_Core = require("VSS/Utils/Core");
import Q = require("q");
import * as React from "react";
import * as ReactDOM from "react-dom";

interface DialogProps {
    name: string;
}

class ReactDialog extends React.Component<DialogProps, any> {
    constructor(props: DialogProps) {
        super(props);
    }

    render() {
        return <p>Hello, {this.props.name}!</p>;
    }
}

export class Dialog {
    public render() {
        var AutosaveView = React.createClass({
            componentDidMount: function () {
                window.alert("Mount!");  
            },
            render: function() {
                var loading = this.props != null;

                return <div>
                    <h2>HomeView {loading}</h2>
                    <ReactDialog name="world" />
                </div>;
            }
        } as React.ComponentSpec<{}, {}>);

        ReactDOM.render(<AutosaveView />, document.getElementById("content"));
    }
}


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
