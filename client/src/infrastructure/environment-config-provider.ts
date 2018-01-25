import * as $ from 'jquery';
import { EnvironmentConfigProvider as EnvironmentConfigProviderBase, HttpMethod, Storage, Query, QueryExecuter as QueryExecuterBase } from 'ef.lms365';
import { LocalStorage } from './local-storage';

class QueryExecuter implements QueryExecuterBase {
    public execute(query: Query): Promise<any> {
        const method = query.method || HttpMethod.GET;
        const contentType = query.contentType != null ? query.contentType : 'application/json';

        return $.ajax({
            cache: false,
            contentType: contentType,
            data: query.data ? JSON.stringify(query.data) : null,
            processData: query.ignoreProcessData ? false : true,
            type: HttpMethod[method],
            url: query.url
        });
    }
}

export class EnvironmentConfigProvider extends EnvironmentConfigProviderBase {
    public static instance: EnvironmentConfigProvider = new EnvironmentConfigProvider();

    private readonly _queryExecuter: QueryExecuter;
    private readonly _storage: Storage;

    public constructor() {
        super();

        this._queryExecuter = new QueryExecuter();
        this._storage = new LocalStorage();
    }

    protected get queryExecuter(): QueryExecuter {
        return this._queryExecuter;
    }

    protected get storage(): Storage {
        return this._storage;
    }
}