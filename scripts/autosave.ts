import VSS_Utils_Core = require("VSS/Utils/Core");
import Q = require("q");
import {IWorkItemFieldChangedArgs, IWorkItemNotificationListener} from "TFS/WorkItemTracking/ExtensionContracts"
import {IWorkItemFormService, WorkItemFormService} from "TFS/WorkItemTracking/Services";

export class Autosave {
    private _throttledFieldChangeDelegate: IArgsFunctionR<any>;
    private _workItemFormService: IWorkItemFormService;

    public initialize(): IPromise<void> {
        var deferred = Q.defer<void>();

        WorkItemFormService.getService().then(
            (workItemFormService: IWorkItemFormService) => {
                this._workItemFormService = workItemFormService;

                this._throttledFieldChangeDelegate = VSS_Utils_Core.throttledDelegate(
                    this,
                    2500,
                    (args: IWorkItemFieldChangedArgs) => {
                        this._onFieldChanged(args);
                    });
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    public register(): void {
        VSS.register(VSS.getContribution().id, {
            onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
                this._throttledFieldChangeDelegate(args);
            }
        } as IWorkItemNotificationListener);
    }

    private _onFieldChanged(args: IWorkItemFieldChangedArgs): void {
        // Quick check, is this a new work item.  If so, do not autosave
        this._workItemFormService.isNew().then((isNew: boolean) => {
            if (!isNew) {
                this._workItemFormService.beginSaveWorkItem(() => { }, () => { });
            }
        });
    }
}