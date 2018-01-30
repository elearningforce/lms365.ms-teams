import { Message, Session, EntityRecognizer } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { CourseCatalog } from '../models';
import { ResourceSet } from '../resource-set';
import { CommonHelper } from '../helpers/common-helper';

const resourceSet = ResourceSet.instance;

export class SelectCourseCatalogAction implements Action {
    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        const urlEntity = EntityRecognizer.findEntity(args.intent.entities, 'builtin.url');

        if (urlEntity) {
            const url = decodeURI((urlEntity as any).entity);
            const courseCatalog = await lmsContext.modelStorages.courseCatalogs.getByUrl(url);

            if (courseCatalog) {
                lmsContext.courseCatalog = courseCatalog;

                const tenantInfo = await lmsContext.modelStorages.tenantInfo.get();
                const attachment = lmsContext.attachmentBuilders.greeting.buildShortMode(tenantInfo, resourceSet.CourseCatalogList_WasSelected(courseCatalog.url));
                
                session.send(new Message(session).addAttachment(attachment));
            } else {
                session.send(resourceSet.CourseCatalogList_NotFound);
            }
        } else {
            session.send(resourceSet.CourseCatalogList_EmptyUrl);
        }

        session.endDialog();
    }
};