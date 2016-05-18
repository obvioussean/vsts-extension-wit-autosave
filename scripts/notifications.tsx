/// <reference path='../typings/tsd.d.ts' />
import TFS_Core_Client = require("TFS/Core/RestClient");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import TFS_WorkItemTracking_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_WorkItemTracking_Contracts = require("TFS/WorkItemTracking/Contracts");
import TFS_WorkItemTracking_ExtensionContracts = require("TFS/WorkItemTracking/ExtensionContracts");
import TFS_WorkItemTracking_Services = require("TFS/WorkItemTracking/Services");
import VSS_Utils_Core = require("VSS/Utils/Core");
import Q = require("q");
import {AutosaveSettings} from "scripts/autosaveSettings";

export class Notifications {
    private _documentCollection: string = "autosave";
    private _documentOptions: IDocumentOptions = {
        scopeType: "User"
    }
    private _documentId: string = "settings";
    private _autosaveSettings: AutosaveSettings;
    private _throttledFieldChangeDelegate: IArgsFunctionR<any>;
    private _workItemFormService: TFS_WorkItemTracking_Services.IWorkItemFormService;
    private _dataService: IExtensionDataService;

    public initialize(): IPromise<void> {
        var deferred = Q.defer<void>();

        TFS_WorkItemTracking_Services.WorkItemFormService.getService().then(
            (workItemFormService: TFS_WorkItemTracking_Services.IWorkItemFormService) => {
                this._workItemFormService = workItemFormService;

                return VSS.getService(VSS.ServiceIds.ExtensionData);
            })
            .then((dataService: IExtensionDataService) => {
                this._dataService = dataService;
                // TODO: remove, this is just for testing
                return this._dataService.deleteDocument(
                    this._documentCollection,
                    this._documentId,
                    this._documentOptions);
            })
            .then((value: void) => {
                return this._dataService.getDocument(
                    this._documentCollection,
                    this._documentId,
                    this._documentOptions);
            })
            .then((document: AutosaveSettings) => {
                this._initializeComplete(document);
                deferred.resolve(null);
            }, (reason: any) => {
                this._initializeComplete(new AutosaveSettings());
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    public register(): void {
        VSS.register("notifications", {
            onFieldChanged: (args: TFS_WorkItemTracking_ExtensionContracts.IWorkItemFieldChangedArgs) => {
                this._throttledFieldChangeDelegate(args);
            }
        } as TFS_WorkItemTracking_ExtensionContracts.IWorkItemNotificationListener);
    }

    private _initializeComplete(document: AutosaveSettings): void {
        this._autosaveSettings = document;
        this._throttledFieldChangeDelegate = VSS_Utils_Core.throttledDelegate(
            this,
            this._autosaveSettings.delay,
            (args: TFS_WorkItemTracking_ExtensionContracts.IWorkItemFieldChangedArgs) => {
                this._onFieldChanged(args);
            });
    }

    private _onFieldChanged(args: TFS_WorkItemTracking_ExtensionContracts.IWorkItemFieldChangedArgs): IPromise<void> {
        var deferred = Q.defer<void>();

        // Quick check, is this a new work item.  If so, do no autosave
        this._workItemFormService.isNew().then((isNew: boolean) => {
            if (!isNew) {
                // Is the field being changed excluded?
                this._workItemFormService.getFieldValues(["System.TeamProject", "System.WorkItemType"]).then((values: IDictionaryStringTo<Object>) => {
                    var autosaveEnabled: boolean = true;
                    var noExcludedFields: boolean = true;

                    // TODO: cache project name -> guid mapping
                    var projectName: string = values["System.TeamProject"] as string;
                    var projectSettings = this._autosaveSettings.projectSettings[projectName];

                    // If we don't have any settings, everything is on
                    if (!$.isEmptyObject(projectSettings)) {
                        var workItemTypeName: string = values["System.WorkItemType"] as string;
                        var typeSettings = projectSettings.typeSettings[workItemTypeName];

                        // If we don't have anything for this type, everything is on.
                        if (!$.isEmptyObject(typeSettings)) {
                            autosaveEnabled = typeSettings.enabled;

                            if (autosaveEnabled &&
                                $.isArray(typeSettings.excludedFields)) {
                                typeSettings.excludedFields.every(field => {
                                    if (!$.isEmptyObject(args.changedFields[field])) {
                                        noExcludedFields = false;
                                        return false;
                                    }
                                });
                            }
                        }
                    }

                    if (autosaveEnabled && noExcludedFields) {
                        this._workItemFormService.beginSaveWorkItem(() => { }, () => { });
                    }
                });
            }
        });

        return deferred.promise;
    }
}