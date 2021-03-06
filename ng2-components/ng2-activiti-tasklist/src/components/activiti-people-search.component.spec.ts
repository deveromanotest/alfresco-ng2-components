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

import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { CoreModule, AlfrescoTranslationService } from 'ng2-alfresco-core';
import { ActivitiPeopleSearch } from './activiti-people-search.component';
import { PeopleList } from './adf-people-list.component';
import { DataTableModule } from 'ng2-alfresco-datatable';
import { User } from '../models/user.model';

declare let jasmine: any;

const fakeUser: User = new User({
    id: '1',
    firstName: 'fake-name',
    lastName: 'fake-last',
    email: 'fake@mail.com'
});

const fakeSecondUser: User = new User({
    id: '2',
    firstName: 'fake-involve-name',
    lastName: 'fake-involve-last',
    email: 'fake-involve@mail.com'
});

describe('ActivitiPeopleSearch', () => {

    let activitiPeopleSearchComponent: ActivitiPeopleSearch;
    let fixture: ComponentFixture<ActivitiPeopleSearch>;
    let element: HTMLElement;
    let componentHandler;
    let userArray = [fakeUser, fakeSecondUser];
    let searchInput: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CoreModule.forRoot(),
                DataTableModule
            ],
            declarations: [
                ActivitiPeopleSearch,
                PeopleList
            ]
        }).compileComponents().then(() => {

            let translateService = TestBed.get(AlfrescoTranslationService);
            spyOn(translateService, 'addTranslationFolder').and.stub();
            spyOn(translateService.translate, 'get').and.callFake((key) => { return Observable.of(key); });

            fixture = TestBed.createComponent(ActivitiPeopleSearch);
            activitiPeopleSearchComponent = fixture.componentInstance;
            element = fixture.nativeElement;
            componentHandler = jasmine.createSpyObj('componentHandler', [
                'upgradeAllRegistered'
            ]);

            window['componentHandler'] = componentHandler;
            activitiPeopleSearchComponent.results = Observable.of([]);
            fixture.detectChanges();
        });
    }));

    it('should show input search text', () => {
        expect(element.querySelector('#userSearchText')).toBeDefined();
        expect(element.querySelector('#userSearchText')).not.toBeNull();
    });

    it('should hide people-list container', () => {
        fixture.detectChanges();
        fixture.whenStable()
            .then(() => {
                expect(element.querySelector('#search-people-list')).toBeNull();
            });

    });

    it('should show user which can be involved ', (done) => {
        activitiPeopleSearchComponent.searchPeople.subscribe(() => {
            activitiPeopleSearchComponent.results = Observable.of(userArray);
            activitiPeopleSearchComponent.ngOnInit();
            fixture.detectChanges();
            fixture.whenStable()
                .then(() => {
                    let gatewayElement: any = element.querySelector('#search-people-list tbody');
                    expect(gatewayElement).not.toBeNull();
                    expect(gatewayElement.children.length).toBe(2);
                    done();
                });
        });
        searchInput = element.querySelector('#userSearchText');
        searchInput.value = 'fake-search';
        activitiPeopleSearchComponent.searchUser.markAsDirty();
        searchInput.dispatchEvent(new Event('input'));
    });

    it('should send an event when an user is clicked', (done) => {
        activitiPeopleSearchComponent.success.subscribe((user) => {
            expect(user).toBeDefined();
            expect(user.firstName).toBe('fake-name');
            done();
        });
        activitiPeopleSearchComponent.results = Observable.of(userArray);
        activitiPeopleSearchComponent.ngOnInit();
        fixture.detectChanges();
        fixture.whenStable()
            .then(() => {
                activitiPeopleSearchComponent.onRowClick(fakeUser);
                let addUserButton = <HTMLElement> element.querySelector('#add-people');
                addUserButton.click();
            });
    });

    it('should remove clicked user', (done) => {
        activitiPeopleSearchComponent.results = Observable.of(userArray);
        activitiPeopleSearchComponent.ngOnInit();
        fixture.detectChanges();
        activitiPeopleSearchComponent.onRowClick(fakeUser);
        let addUserButton = <HTMLElement> element.querySelector('#add-people');
        addUserButton.click();

        fixture.detectChanges();
        fixture.whenStable()
            .then(() => {
                let gatewayElement: any = element.querySelector('#search-people-list tbody');
                expect(gatewayElement).not.toBeNull();
                expect(gatewayElement.children.length).toBe(1);
                done();
            });
    });
});
