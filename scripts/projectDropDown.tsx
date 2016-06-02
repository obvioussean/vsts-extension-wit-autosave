import {TeamProjectReference} from "TFS/Core/Contracts";
import * as React from "react";
import * as ReactDOM from "react-dom";

interface IProjectDropdownProps {
    projects: TeamProjectReference[];
    selectedProject: string;
    projectChanged: React.FormEventHandler;
}

export class ProjectDropdown extends React.Component<IProjectDropdownProps, any> {
    constructor(props: IProjectDropdownProps) {
        super(props);
    }

    render() {
        let renderProjects = (project: TeamProjectReference) => {
            return <option value={project.id}>{project.name}</option>;
        };

        return <select value={this.props.selectedProject} onChange={this.props.projectChanged}>{this.props.projects.map(renderProjects) }</select>;
    }
}