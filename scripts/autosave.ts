/// <reference path='../typings/tsd.d.ts' />
import TFS_WorkItemTracking_ExtensionContracts = require("TFS/WorkItemTracking/ExtensionContracts");
import TFS_WorkItemTracking_Services = require("TFS/WorkItemTracking/Services");
import VSS_Utils_Core = require("VSS/Utils/Core");
import Q = require("q");

export class Autosave {
    private _throttledDelegate: IArgsFunctionR<any> = VSS_Utils_Core.throttledDelegate(this, 2000, () => {
        TFS_WorkItemTracking_Services.WorkItemFormService.getService().then(
            (workItemFormService: TFS_WorkItemTracking_Services.IWorkItemFormService) => {
                workItemFormService.isNew().then((isNew) => {
                    if (!isNew) {
                        workItemFormService.beginSaveWorkItem(() => { }, () => { });
                    }
                });
            });
    });

    public initialize(): IPromise<string> {
        var deferred = Q.defer<string>();
        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
            dataService.getValue("enabled").then(
                (value: string) => {
                    deferred.resolve(value);
                });
        });

        return deferred.promise;
    }

    public register() {
        VSS.register("vsts-extension-wit-autosave-notifications", <TFS_WorkItemTracking_ExtensionContracts.IWorkItemNotificationListener>{
            onFieldChanged: (args: TFS_WorkItemTracking_ExtensionContracts.IWorkItemFieldChangedArgs) => {
                this._throttledDelegate();
            }
        });

        VSS.register("vsts-extension-wit-autosave-toolbar", <IContributedMenuSource>{
            getMenuItems: (context) => {
                return [<IContributedMenuItem>{
                    title: "Work Item Menu Action",
                    action: (actionContext) => {
                        let workItemId = actionContext.workItemId;
                        if (workItemId) {
                            alert(`Selected work item ${workItemId}`);
                        }
                    }
                }];
            },
            execute: (actionContext) => {

            }
        });
    }
}










