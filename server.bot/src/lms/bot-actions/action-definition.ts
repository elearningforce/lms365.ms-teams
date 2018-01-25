import { Session } from 'botbuilder';
import { LmsContext } from '../lms-context';
import { LmsContextProvider } from '../lms-context-provider';
import { ResourceSet } from '../resource-set';

const resourceSet = ResourceSet.instance;

export interface ActionDefinition {
    action: Action;
    key: string;
    title: string;
    titleFormat?: (...args: any[]) => string;
}

export interface Action {
    handle(session: Session, lmsContext: LmsContext, args?: any, next?: any);
}

export const wrapAction = (actionDefinition: ActionDefinition) =>
    async (session: Session, args: any, next: any) => {
        session.sendTyping();

        try {
            const lmsContext = await LmsContextProvider.instance.get(session);

            actionDefinition.action.handle(session, lmsContext, args, next);
        } catch {
            session.send(resourceSet.TenantNotAccessible);
        }
    };