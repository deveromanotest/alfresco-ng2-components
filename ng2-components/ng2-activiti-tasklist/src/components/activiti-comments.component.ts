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
import { AlfrescoTranslationService } from 'ng2-alfresco-core';
import { Observable, Observer } from 'rxjs/Rx';
import { Comment } from '../models/comment.model';
import { ActivitiTaskListService } from './../services/activiti-tasklist.service';

declare let dialogPolyfill: any;

@Component({
    selector: 'activiti-comments',
    templateUrl: './activiti-comments.component.html',
    styleUrls: ['./activiti-comments.component.css'],
    providers: [ActivitiTaskListService]
})
export class ActivitiComments implements OnChanges {

    @Input()
    public taskId: string;

    @Input()
    public readOnly: boolean = false;

    @Output()
    public error: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('dialog')
    public dialog: any;

    public comments: Comment [] = [];

    private commentObserver: Observer<Comment>;
    public comment$: Observable<Comment>;

    public message: string;

    /**
     * Constructor
     * @param translate Translation service
     * @param activitiTaskList Task service
     */
    constructor(private translateService: AlfrescoTranslationService,
                private activitiTaskList: ActivitiTaskListService) {

        if (translateService) {
            translateService.addTranslationFolder('ng2-activiti-tasklist', 'assets/ng2-activiti-tasklist');
        }

        this.comment$ = new Observable<Comment>((observer) => this.commentObserver = observer).share();
        this.comment$.subscribe((comment: Comment) => {
            this.comments.push(comment);
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        let taskId = changes.taskId;
        if (taskId) {
            if (taskId.currentValue) {
                this.getTaskComments(taskId.currentValue);
            } else {
                this.resetComments();
            }
        }
    }

    private getTaskComments(taskId: string): void {
        this.resetComments();
        if (taskId) {
            this.activitiTaskList.getTaskComments(taskId).subscribe(
                (res: Comment[]) => {
                    res.forEach((comment) => {
                        this.commentObserver.next(comment);
                    });
                },
                (err) => {
                    this.error.emit(err);
                }
            );
        } else {
            this.resetComments();
        }
    }

    private resetComments(): void {
        this.comments = [];
    }

    public showDialog(): void {
        if (!this.dialog.nativeElement.showModal) {
            dialogPolyfill.registerDialog(this.dialog.nativeElement);
        }
        this.dialog.nativeElement.showModal();
    }

    public add(): void {
        this.activitiTaskList.addTaskComment(this.taskId, this.message).subscribe(
            (res: Comment) => {
                this.comments.push(res);
                this.message = '';
            },
            (err) => {
                this.error.emit(err);
            }
        );
        this.cancel();
    }

    public cancel(): void {
        if (this.dialog) {
            this.dialog.nativeElement.close();
        }
    }
}
