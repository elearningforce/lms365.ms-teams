import { Message, Session, EntityRecognizer } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { CourseCatalog } from '../models';
import { ResourceSet } from '../resource-set';
import { CommonHelper } from '../helpers/common-helper';

const resourceSet = ResourceSet.instance;

export class SelectCourseCatalogAction implements Action {
    public handle(session: Session, lmsContext: LmsContext, args: any) {
        const urlEntity = EntityRecognizer.findEntity(args.intent.entities, 'builtin.url');
        const message = lmsContext.message;

        if (urlEntity) {
            const url = decodeURI((urlEntity as any).entity);

            lmsContext.modelStorages.courseCatalogs.getByUrl(url)
                .then(courseCatalog => {
                    if (courseCatalog) {
                        lmsContext.userStorage.set(CommonHelper.Keys.CourseCatalog, courseCatalog);
                        
                        session.send(resourceSet.CourseCatalogList_WasSelected(courseCatalog.url));
                    } else {
                        session.send(resourceSet.CourseCatalogList_NotFound);
                    }
                });
        } else {
            session.send(resourceSet.CourseCatalogList_EmptyUrl);
        }

        session.endDialog();
    }
};