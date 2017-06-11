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

/**
 *
 * This object represent the user.
 *
 *
 * @returns {User} .
 */

export class User {
    public id: number;
    public  email: string;
    public firstName: string;
    public lastName: string;

    constructor(obj?: any) {
        this.id = obj && obj.id;
        this.email = obj && obj.email || null;
        this.firstName = obj && obj.firstName || null;
        this.lastName = obj && obj.lastName || null;
    }
}
