import { Session } from 'botbuilder';
import * as requestExecutor from 'request-promise';
import { EnvironmentConfigProvider as EnvironmentConfigProviderBase, Storage, Query, QueryExecuter as QueryExecuterBase } from 'ef.lms365';

class QueryExecuter implements QueryExecuterBase {
    public execute(query: Query): Promise<any> {
        const options = {
            json: true,
            uri: query.url
        };

        return requestExecutor(options);
    }
}

export class EnvironmentConfigProvider extends EnvironmentConfigProviderBase {
    private readonly _queryExecuter: QueryExecuter;
    private readonly _storage: Storage;

    public constructor(session: Session, storage: Storage) {
        super();

        this._queryExecuter = new QueryExecuter();
        this._storage = storage;
    }

    protected get queryExecuter(): QueryExecuter {
        return this._queryExecuter;
    }

    protected get storage(): Storage {
        return this._storage;
    }
}