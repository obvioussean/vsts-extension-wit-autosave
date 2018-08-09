import { AutosaveDocument } from "./autosaveDocument";

const defaultDocument = {
    delay: 2500,
    discussionsDisabled: true,
    richTextDisabled: false,
} as AutosaveDocument;

export class SettingsManager {
    private _documentCollection: string = "autosave";
    private _documentOptions: IDocumentOptions = {
        scopeType: "User"
    }
    private _documentId: string = "settings";


    public getSettings(): IPromise<AutosaveDocument> {
        let dataService: IExtensionDataService;
        return VSS.getService(VSS.ServiceIds.ExtensionData).then((s: IExtensionDataService) => {
            dataService = s;
            return dataService.getDocument(this._documentCollection, this._documentId, this._documentOptions);
        }).then((autosaveDocument: AutosaveDocument) => {
            return {
                ...defaultDocument,
                ...autosaveDocument
            };
        }, (reason) => {
            const document: AutosaveDocument = {
                ...defaultDocument,
                id: this._documentId,
            };

            return dataService.createDocument(
                this._documentCollection,
                document,
                this._documentOptions);
        });
    }

    public updateSettings(autosaveDocument: AutosaveDocument): IPromise<AutosaveDocument> {
        return VSS.getService(VSS.ServiceIds.ExtensionData).then((dataService: IExtensionDataService) => {
            return dataService.updateDocument(this._documentCollection, autosaveDocument, this._documentOptions).then((document: AutosaveDocument) => {
                return document;
            });
        });
    }
}

