import {WorkItemType} from "TFS/WorkItemTracking/Contracts";
import * as React from "react";

interface IWorkItemTypeDropdownProps {
    selectedWorkItemType: string;
    workItemTypes: WorkItemType[];
    workItemTypeChanged: React.FormEventHandler;
}

export class WorkItemTypeDropDown extends React.Component<IWorkItemTypeDropdownProps, any> {
    constructor(props: IWorkItemTypeDropdownProps) {
        super(props);
    }
    
    render() {
        let renderWorkItemTypes = (workItemType: WorkItemType) => {
            return <option value={workItemType.name}>{workItemType.name}</option>;
        };

        return <select value={this.props.selectedWorkItemType} onChange={this.props.workItemTypeChanged}>{this.props.workItemTypes.map(renderWorkItemTypes) }</select>;
    }
}
