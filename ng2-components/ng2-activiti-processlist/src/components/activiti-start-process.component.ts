/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RestVariable } from 'alfresco-js-api';
import { ActivitiStartForm } from 'ng2-activiti-form';
import { AlfrescoTranslationService } from 'ng2-alfresco-core';
import { ProcessDefinitionRepresentation } from './../models/process-definition.model';
import { ProcessInstance } from './../models/process-instance.model';
import { ActivitiProcessService } from './../services/activiti-process.service';

declare let componentHandler: any;
declare let dialogPolyfill: any;

@Component({
    selector: 'activiti-start-process',
    templateUrl: './activiti-start-process.component.html',
    styleUrls: ['./activiti-start-process.component.css']
})
export class ActivitiStartProcessInstance implements OnChanges {

    @Input()
    public appId: string;

    @Input()
    public variables: RestVariable;

    @Output()
    public start: EventEmitter<ProcessInstance> = new EventEmitter<ProcessInstance>();

    @Output()
    public error: EventEmitter<ProcessInstance> = new EventEmitter<ProcessInstance>();

    @ViewChild(ActivitiStartForm)
    public startForm: ActivitiStartForm;

    public processDefinitions: ProcessDefinitionRepresentation[] = [];

    public name: string;

    public currentProcessDef: ProcessDefinitionRepresentation = new ProcessDefinitionRepresentation();

    public errorMessageId: string = '';

    constructor(private translate: AlfrescoTranslationService,
                private activitiProcess: ActivitiProcessService) {

        if (translate) {
            translate.addTranslationFolder('ng2-activiti-processlist', 'assets/ng2-activiti-processlist');
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        let appId = changes.appId;
        if (appId && (appId.currentValue || appId.currentValue === null)) {
            this.load(appId.currentValue);
            return;
        }
    }

    public load(appId: string): void {
        this.resetSelectedProcessDefinition();
        this.resetErrorMessage();
        this.activitiProcess.getProcessDefinitions(appId).subscribe(
            (res) => {
                this.processDefinitions = res;
            },
            () => {
                this.errorMessageId = 'START_PROCESS.ERROR.LOAD_PROCESS_DEFS';
            }
        );
    }

    public startProcess(outcome?: string): void {
        if (this.currentProcessDef.id && this.name) {
            this.resetErrorMessage();
            let formValues = this.startForm ? this.startForm.form.values : undefined;
            this.activitiProcess.startProcess(this.currentProcessDef.id, this.name, outcome, formValues, this.variables).subscribe(
                (res) => {
                    this.name = '';
                    this.start.emit(res);
                },
                (err) => {
                    this.errorMessageId = 'START_PROCESS.ERROR.START';
                    this.error.error(err);
                }
            );
        }
    }

    public onProcessDefChange(processDefinitionId): void {
        let processDef = this.processDefinitions.find((processDefinition) => {
            return processDefinition.id === processDefinitionId;
        });
        if (processDef) {
            this.currentProcessDef = JSON.parse(JSON.stringify(processDef));
        } else {
            this.resetSelectedProcessDefinition();
        }
    }

    public hasStartForm(): boolean {
        return this.currentProcessDef && this.currentProcessDef.hasStartForm;
    }

    public isStartFormMissingOrValid(): boolean {
        if (this.startForm) {
            return this.startForm.form && this.startForm.form.isValid;
        } else {
            return true;
        }
    }

    public validateForm(): any {
        return this.currentProcessDef.id && this.name && this.isStartFormMissingOrValid();
    }

    private resetSelectedProcessDefinition(): void {
        this.currentProcessDef = new ProcessDefinitionRepresentation();
    }

    private resetErrorMessage(): void {
        this.errorMessageId = '';
    }

    public onOutcomeClick(outcome: string): void {
        this.startProcess(outcome);
    }

    public reset(): void {
        this.resetSelectedProcessDefinition();
        this.name = '';
        if (this.startForm) {
            this.startForm.data = {};
        }
        this.resetErrorMessage();
    }
}
