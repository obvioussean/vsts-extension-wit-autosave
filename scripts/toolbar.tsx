/// <reference path='../typings/tsd.d.ts' />

export class Toolbar {
    public register(): void {
        VSS.register("toolbar", {
            getMenuItems: (context) => {
                return [{
                    title: "Configure Work Item Autosave",
                    action: (actionContext) => {
                        this._showDialog(actionContext.workItemId);
                    }
                } as IContributedMenuItem];
            },
            execute: (actionContext) => {
                //no-op since action is implemented.
            }
        } as IContributedMenuSource);
    }

    private _showDialog(workItemId: number) {
        VSS.getService(VSS.ServiceIds.Dialog).then((dialogService: IHostDialogService) => {
            var extInfo = VSS.getExtensionContext();

            var dialogOptions: IHostDialogOptions = {
                title: "Work Item Autosave Configuration",
                width: 800,
                height: 600,
                buttons: null
            };

            var contributionConfig = {
                properties: null
            };

            dialogService.openDialog(
                extInfo.publisherId + "." + extInfo.extensionId + ".dialog",
                dialogOptions,
                contributionConfig).then((dialog: IExternalDialog) => {

                });
        });
    }
}