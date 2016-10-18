import { AutosaveDocument } from "scripts/autosaveDocument";
import { SettingsManager } from "scripts/settingsManager";
import { FormInputControl, FormInputControlOptions, InputsViewModel, InputViewModel, FormInputViewModel } from "VSS/Controls/FormInput";
import { InputDescriptor, InputMode, InputDataType } from "VSS/Common/Contracts/FormInput";

export class SettingsRenderer {
    private _saving: boolean = false;
    private _document: AutosaveDocument;

    public initialize(): IPromise<any> {
        let settingsManager = new SettingsManager();
        return settingsManager.getSettings().then((document: AutosaveDocument) => {
            this._document = document;
        }).then(() => {
            let formInputViewModel = new FormInputViewModel(
                null,
                null,
                null,
                null,
                null
            );

            let delayInputDescriptor: InputDescriptor = $.extend({}, {
                id: "delay",
                inputMode: InputMode.TextBox,
                description: "The amount of time to wait since the last input before invoking autosave",
                name: "Autosave delay",
                valueHint: "The delay before saving in milliseconds",
                validation: {
                    dataType: InputDataType.Number,
                    isRequired: true
                }
            });

            let richTextInputDescriptor: InputDescriptor = $.extend({}, {
                id: "richTextDisabled",
                inputMode: InputMode.CheckBox,
                description: "Disable autosave for rich text fields",
                name: "Disable autosave for rich text fields"
            });

            let inputDescriptors: InputDescriptor[] = [
                delayInputDescriptor,
                richTextInputDescriptor
            ];

            let inputValues: { [key: string]: any } = {
                "delay": this._document.delay,
                "richTextDisabled": this._document.richTextDisabled
            };

            let inputsViewModel = new InputsViewModel(
                formInputViewModel,
                inputDescriptors,
                inputValues,
                null,
                null);

            let options: FormInputControlOptions = {
                inputsViewModel: inputsViewModel,
                headerLabel: "Settings",
                comboControlMap: null
            };

            FormInputControl.createControl($("#content"), options);

            let saveButton = $("<button>").attr("id", "save").text("Save");
            saveButton.appendTo("#content");

            saveButton.on("click", () => {
                this._saving = true;
                this._document.delay = inputsViewModel.getInputViewModelById("delay").getValue();
                this._document.richTextDisabled = inputsViewModel.getInputViewModelById("richTextDisabled").getValue();
                saveButton.prop("disabled", true);
                saveButton.text("Saving...");
                settingsManager.updateSettings(this._document).then((document: AutosaveDocument) => {
                    this._saving = false;
                    saveButton.prop("disabled", !inputsViewModel.areValid());
                    saveButton.text("Save");
                }, (reason) => {
                    this._saving = false;
                    saveButton.text("Save");
                    saveButton.prop("disabled", !inputsViewModel.areValid());
                });
            });
        });
    }
}