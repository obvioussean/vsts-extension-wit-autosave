import * as VSS_Utils_Core from "VSS/Utils/Core";
import * as VSS_Utils_Array from "VSS/Utils/Array";
import * as Q from "q";
import { IWorkItemFieldChangedArgs, IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts"
import { WorkItemField, FieldType } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemFormService, WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { SettingsManager } from "scripts/settingsManager";
import { AutosaveDocument } from "scripts/autosaveDocument";

export class Autosave {
    private _settings: AutosaveDocument;
    private _throttledFieldChangeDelegate: IArgsFunctionR<any>;
    private _workItemFormService: IWorkItemFormService;
    private _fieldDictionary: IDictionaryStringTo<WorkItemField>;
    private _menuItem: IContributedMenuItem;
    private _autosaveEnabled: boolean = true;
    private _context: any;
    private _workItemFieldChangedArgs: IWorkItemFieldChangedArgs;

    public initialize(): IPromise<any> {
        let settings = new SettingsManager();
        return settings.getSettings().then((settings: AutosaveDocument) => {
            this._settings = settings;

            this._throttledFieldChangeDelegate = VSS_Utils_Core.throttledDelegate(
                this,
                this._settings.delay,
                this._onFieldChanged);

            return WorkItemFormService.getService();
        }).then((workItemFormService: IWorkItemFormService) => {
            this._workItemFormService = workItemFormService;

            return this._workItemFormService.getFields();
        }).then((fields) => {
            this._fieldDictionary = VSS_Utils_Array.toDictionary(
                fields,
                (item, index) => {
                    return item.referenceName;
                },
                (item, index) => {
                    return item;
                });
        });
    }

    public register(): void {
        VSS.register(`${VSS.getExtensionContext().publisherId}.${VSS.getExtensionContext().extensionId}.autosave-toolbar-button`, {
            execute: (context) => {
                this._autosaveEnabled = !this._autosaveEnabled;
                // set the text of the button
                if (this._autosaveEnabled) {
                    this._menuItem.text = "Disable Autosave";
                    //this._menuItem.icon = "bowtie-save-close"
                }
                else {
                    this._menuItem.text = "Enable Autosave";
                    //this._menuItem.icon = "bowtie-save"
                }

                this._context.updateMenuItems([this._menuItem]);
            },
            getMenuItems: (context) => {
                this._context = context;
                this._menuItem = {
                    id: "Autosave",
                    text: "Disable Autosave",
                    //icon: "bowtie-save-close"
                };

                return [this._menuItem];
            }
        });

        VSS.register(`${VSS.getExtensionContext().publisherId}.${VSS.getExtensionContext().extensionId}.autosave`, {
            onFieldChanged: (args: IWorkItemFieldChangedArgs) => {
                this._workItemFieldChangedArgs = args;
                this._throttledFieldChangeDelegate();
            }
        } as IWorkItemNotificationListener);
    }

    private _onFieldChanged(): void {
        if (!this._workItemFieldChangedArgs) {
            return;
        }

        // Autosave temporarily disabled, so just quickly bail out.
        if (!this._autosaveEnabled) {
            return;
        }

        let htmlFieldChanged: boolean = false;
        if (this._settings.richTextDisabled) {
            for (let fieldReferenceName in this._workItemFieldChangedArgs.changedFields) {
                if (this._fieldDictionary[fieldReferenceName] &&
                    this._fieldDictionary[fieldReferenceName].type == FieldType.Html) {
                    htmlFieldChanged = true;
                    break;
                }
            }
        }

        if (!htmlFieldChanged) {
            // Quick check, is this a new work item.  If so, do not autosave
            this._workItemFormService.isNew().then((isNew: boolean) => {
                if (!isNew) {
                    this._workItemFormService.beginSaveWorkItem(() => { }, () => { });
                }
            });
        }
    }
}