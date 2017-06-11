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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivitiContentService } from 'ng2-activiti-form';
import { AlfrescoTranslationService, ContentService } from 'ng2-alfresco-core';

@Component({
    selector: 'adf-task-attachment-list',
    styleUrls: ['./adf-task-attachment-list.component.css'],
    templateUrl: './adf-task-attachment-list.component.html'
})
export class TaskAttachmentListComponent implements OnChanges {

    @Input()
    public taskId: string;

    @Output()
    public attachmentClick = new EventEmitter();

    @Output()
    public success = new EventEmitter();

    @Output()
    public error: EventEmitter<any> = new EventEmitter<any>();

    public attachments: any[] = [];

    constructor(private translateService: AlfrescoTranslationService,
                private activitiContentService: ActivitiContentService,
                private contentService: ContentService) {

        if (translateService) {
            translateService.addTranslationFolder('ng2-activiti-tasklist', 'assets/ng2-activiti-tasklist');
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.taskId && changes.taskId.currentValue) {
            this.loadAttachmentsByTaskId(changes.taskId.currentValue);
        }
    }

    public reset(): void {
        this.attachments = [];
    }

    public reload(): void {
        this.loadAttachmentsByTaskId(this.taskId);
    }

    private loadAttachmentsByTaskId(taskId: string): any {
        if (taskId) {
            this.reset();
            this.activitiContentService.getTaskRelatedContent(taskId).subscribe(
                (res: any) => {
                    res.data.forEach((content) => {
                        this.attachments.push({
                            id: content.id,
                            name: content.name,
                            created: content.created,
                            createdBy: content.createdBy.firstName + ' ' + content.createdBy.lastName,
                            icon: this.activitiContentService.getMimeTypeIcon(content.mimeType)
                        });
                    });
                    this.success.emit(this.attachments);
                },
                (err) => {
                    this.error.emit(err);
                });
        }
    }

    private deleteAttachmentById(contentId: string): void {
        if (contentId) {
            this.activitiContentService.deleteRelatedContent(contentId).subscribe(
                () => {
                    this.attachments = this.attachments.filter((content) => {
                        return content.id !== contentId;
                    });
                },
                (err) => {
                    this.error.emit(err);
                });
        }
    }

    public isEmpty(): boolean {
        return this.attachments && this.attachments.length === 0;
    }

    public onShowRowActionsMenu(event: any): void {
        let viewAction = {
            title: 'View',
            name: 'view'
        };

        let removeAction = {
            title: 'Remove',
            name: 'remove'
        };

        let downloadAction = {
            title: 'Download',
            name: 'download'
        };

        event.value.actions = [
            viewAction,
            removeAction,
            downloadAction
        ];
    }

    public onExecuteRowAction(event: any): void {
        let args = event.value;
        let action = args.action;
        if (action.name === 'view') {
            this.emitDocumentContent(args.row.obj);
        } else if (action.name === 'remove') {
            this.deleteAttachmentById(args.row.obj.id);
        } else if (action.name === 'download') {
            this.downloadContent(args.row.obj);
        }
    }

    public openContent(event: any): void {
        let content = event.value.obj;
        this.emitDocumentContent(content);
    }

    public emitDocumentContent(content: any): void {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => {
                content.contentBlob = blob;
                this.attachmentClick.emit(content);
            },
            (err) => {
                this.error.emit(err);
            }
        );
    }

    public downloadContent(content: any): void {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => this.contentService.downloadBlob(blob, content.name),
            (err) => {
                this.error.emit(err);
            }
        );
    }
}
