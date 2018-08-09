import { FieldType, WorkItemField } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemFieldChangedArgs, IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import { IWorkItemFormService, WorkItemFormService } from "TFS/WorkItemTracking/Services";
import * as VSS_Utils_Array from "VSS/Utils/Array";
import * as VSS_Utils_Core from "VSS/Utils/Core";
import { AutosaveDocument } from "./autosaveDocument";
import { SettingsManager } from "./settingsManager";

export class Autosave {
    private _settings: AutosaveDocument;
    private _throttledFieldChangeDelegate: IArgsFunctionR<any>;
    private _workItemFormService: IWorkItemFormService;
    private _fieldDictionary: IDictionaryStringTo<WorkItemField>;
    private _menuItem: IContributedMenuItem;
    private _autosaveEnabled: boolean = true;
    private _context: any;
    private _workItemFieldChangedArgs: IWorkItemFieldChangedArgs;

    public async initialize(): Promise<any> {
        const settingsManager = new SettingsManager();
        this._settings = await settingsManager.getSettings();

        this._throttledFieldChangeDelegate = VSS_Utils_Core.throttledDelegate(
            this,
            this._settings.delay,
            this._onFieldChanged);

        this._workItemFormService = await WorkItemFormService.getService();

        const fields = await this._workItemFormService.getFields();
        this._fieldDictionary = VSS_Utils_Array.toDictionary(
            fields,
            (item, index) => {
                return item.referenceName;
            },
            (item, index) => {
                return item;
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

        let ignoreChange: boolean = false;
        if (this._settings.richTextDisabled) {
            for (let fieldReferenceName in this._workItemFieldChangedArgs.changedFields) {
                if (this._fieldDictionary[fieldReferenceName] &&
                    this._fieldDictionary[fieldReferenceName].type == FieldType.Html) {
                    ignoreChange = true;
                    break;
                }
            }
        }

        if (this._settings.discussionsDisabled) {
            for (let fieldReferenceName in this._workItemFieldChangedArgs.changedFields) {
                if (this._fieldDictionary[fieldReferenceName] &&
                    this._fieldDictionary[fieldReferenceName].referenceName == "System.History") {
                    ignoreChange = true;
                    break;
                }
            }
        }

        if (!ignoreChange) {
            // Quick check, is this a new work item.  If so, do not autosave
            this._workItemFormService.isNew().then((isNew: boolean) => {
                if (!isNew) {
                    this._workItemFormService.beginSaveWorkItem(() => { }, () => { });
                }
            });
        }
    }
}