import { Encryptor } from '../encryptor';

interface User {
    objectId: string;
    loginName?: string;
}

export interface UserToken {
    tenantId: string;
    user: User;
}

export class UserTokenHelper {
    public static encrypt(token: UserToken): string {
        const jsonValue = JSON.stringify(token);

        return Encryptor.encrypt(jsonValue);
    }
}