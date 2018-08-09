import { InputDataType, InputDescriptor, InputMode } from "VSS/Common/Contracts/FormInput";
import { FormInputControl, FormInputControlOptions, FormInputViewModel, InputsViewModel } from "VSS/Controls/FormInput";
import { AutosaveDocument } from "./autosaveDocument";
import { SettingsManager } from "./settingsManager";

export class SettingsRenderer {
    private _saving: boolean = false;
    private _document: AutosaveDocument;

    public async initialize(): Promise<any> {
        const settingsManager = new SettingsManager();
        this._document = await settingsManager.getSettings();

        let formInputViewModel = new FormInputViewModel(
            null,
            null,
            null,
            null,
            null
        );

        let delayInputDescriptor = {
            id: "delay",
            inputMode: InputMode.TextBox,
            description: "The amount of time to wait since the last input before invoking autosave",
            name: "Autosave delay",
            valueHint: "The delay before saving in milliseconds",
            validation: {
                dataType: InputDataType.Number,
                isRequired: true,
            }
        } as InputDescriptor;

        let richTextInputDescriptor = {
            id: "richTextDisabled",
            inputMode: InputMode.CheckBox,
            description: "Disable autosave for rich text fields",
            name: "Disable autosave for rich text fields"
        } as InputDescriptor;

        let discussionsInputDescriptor = {
            id: "discussionsDisabled",
            inputMode: InputMode.CheckBox,
            description: "Disable autosave for discussions",
            name: "Disable autosave for discussions"
        } as InputDescriptor;

        let inputDescriptors: InputDescriptor[] = [
            delayInputDescriptor,
            richTextInputDescriptor,
            discussionsInputDescriptor
        ];

        let inputValues: { [key: string]: any } = {
            "delay": this._document.delay,
            "richTextDisabled": this._document.richTextDisabled,
            "discussionsDisabled": this._document.discussionsDisabled
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
            this._document.discussionsDisabled = inputsViewModel.getInputViewModelById("discussionsDisabled").getValue();
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
    }
}
