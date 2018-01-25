import { Message, Session, EntityRecognizer } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course } from '../models';
import { ResourceSet } from '../resource-set';

const resourceSet = ResourceSet.instance;

export class NoneAction implements Action {
    public handle(session: Session, lmsContext: LmsContext, args: any, next: () => void) {
        session.send(resourceSet.Error);

        next();
    }
};