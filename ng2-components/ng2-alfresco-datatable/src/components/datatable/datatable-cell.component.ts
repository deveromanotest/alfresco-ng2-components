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

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DataColumn, DataRow, DataTableAdapter } from '../../data/index';

@Component({
    selector: 'alfresco-datatable-cell',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: '<ng-container>{{value}}</ng-container>'
})
export class DataTableCellComponent {

    @Input()
    public data: DataTableAdapter;

    @Input()
    public column: DataColumn;

    @Input()
    public row: DataRow;

    @Input()
    public value: any;

    constructor() {
    }

    public ngOnInit(): void {
        if (this.column && this.column.key && this.row && this.data) {
            this.value = this.data.getValue(this.row, this.column);
        }
    }

}
