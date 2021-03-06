import { IChatConnectorAddress } from 'botbuilder';
import { ChannelAccount, TeamsChatConnector } from 'botbuilder-teams';
import * as requestExecutor from 'request-promise';
import { Query } from 'ef.lms365';
import { LmsContext } from './lms-context';
import { CommonHelper } from './helpers/common-helper';
import { UserToken, UserTokenHelper } from './helpers/user-token-helper';

export abstract class QueryExecuterByContext/* implements QueryExecuter*/ {
    private _tokenPromise: Promise<any>;

    protected abstract async getToken(query: Query): Promise<any>;

    protected abstract async executeWithContext<T>(query: Query): Promise<T>;

    protected isTokenValid(token: any): boolean {
        return true;
    }

    protected isTokenValidByError(error: any): boolean {
        return false;
    }

    public async execute<T>(query: Query): Promise<T> {
        if (this.token && this.isTokenValid(this.token)) {
            try {
                return this.executeWithContext<T>(query);
            } catch (error) {
                if (!this.isTokenValidByError(error)) {
                    console.log('Token is invalid.');

                    this.token = null;

                    return this.execute<T>(query);
                } else {
                    throw error;
                }
            }
        } else {
            if (!this._tokenPromise) {
                this._tokenPromise = this.getToken(query)
                    .then(x => {
                        this.token = x;
                        this._tokenPromise = null;

                        return x;
                    });
            }

            await this._tokenPromise;

            return this.executeWithContext<T>(query);
        }
    }

    protected abstract get token(): any;
    protected abstract set token(value: any);
}

export class QueryExecuter extends QueryExecuterByContext {
    private readonly _lmsContext: LmsContext;

    public constructor(lmsContext: LmsContext) {
        super();

        this._lmsContext = lmsContext;
    }

    protected isTokenValid(token: UserToken): boolean {
        return token.user && (token.user.loginName != null) && (token.user.objectId != null);
    }

    protected async executeWithContext<T>(query: Query): Promise<T> {
        const userTokenString = UserTokenHelper.encrypt(this.token);
        const options = {
            headers: {
                'Authorization': `Bearer ${userTokenString}`
            },
            json: true,
            uri: this._lmsContext.environmentConfig.apiUrl + query.url
        };

        console.log('Query:');
        console.dir(options);

        return await requestExecutor(options);
    }

    protected async getToken(query: Query): Promise<any> {
        return new Promise((resolve: (input: any) => void, reject: (reason?: any) => void) => {
            const lmsContext = this._lmsContext;
            const event = this._lmsContext.event;

            const conversationId = event.address.conversation.id;
            const serviceUrl = (event.address as IChatConnectorAddress).serviceUrl;
            const connector = (lmsContext.session.connector as TeamsChatConnector);

            connector.fetchMembers(serviceUrl, conversationId, (error, members: ChannelAccount[]) => {
                if (error) {
                    const objectId = (event.address.user as any).aadObjectId;

                    if (objectId) {
                        const userToken: UserToken = {
                            tenantId: lmsContext.tenantId,
                            user: {
                                objectId: objectId
                            }
                        };

                        resolve(userToken);
                    } else {
                        reject(error);
                    }
                } else {
                    if (members[0].objectId) {
                        const userToken: UserToken = {
                            tenantId: lmsContext.tenantId,
                            user: {
                                loginName: 'i:0#.f|membership|' + members[0].userPrincipalName,
                                objectId: members[0].objectId
                            }
                        };

                        console.log('User token:');
                        console.dir(userToken);

                        resolve(userToken);
                    } else {
                        reject(new Error('User is not identified.'));
                    }
                }
            });
        });
    }

    protected get token(): any {
        return this._lmsContext.userStorage.get(CommonHelper.Keys.UserToken) as UserToken;
    }

    protected set token(value: any) {
        this._lmsContext.userStorage.set(CommonHelper.Keys.UserToken, value);
    }
}