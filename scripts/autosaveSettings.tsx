export class WorkItemTypeSettings {
    public enabled: boolean = true;
    public excludedFields: number[] = [];
}

export class ProjectSettings {
    public typeSettings: IDictionaryStringTo<WorkItemTypeSettings> = {}
}

export class AutosaveSettings {
    public id: string;
    public projectSettings: IDictionaryStringTo<ProjectSettings> = {}
    public delay: number = 2000;
}