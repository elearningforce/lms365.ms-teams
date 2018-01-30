import { LuisRecognizer as LuisRecognizerBase, IRecognizeContext, IIntentRecognizerResult } from 'botbuilder';

const predefinedCommnads = [
    {
        resultCreator: (format: RegExp, message: string) => {
            const regexp = new RegExp(format);
            const matchResult = regexp.exec(message);

            return {
                entities: [
                    {
                        entity: matchResult[1],
                        type: 'CourseType'
                    },
                    {
                        entity: matchResult[2],
                        type: 'Category',
                    }
                ],
                intent: 'SearchCourseList',
                intents: [
                    { intent: 'SearchCourseList', score: 1 }
                ],
                score: 1
            };
        },
        format: /Show (.*) Courses with (.*) category/gi
    },
    {
        resultCreator: (format: RegExp, message: string) => {
            const regexp = new RegExp(format);
            const matchResult = regexp.exec(message);

            return {
                entities: [
                    {
                        entity: matchResult[1],
                        type: 'Category',
                    }
                ],
                intent: 'SearchCourseList',
                intents: [
                    { intent: 'SearchCourseList', score: 1 }
                ],
                score: 1
            };
        },
        format: /Show Courses with (.*) category/gi
    }
];

export class LuisRecognizer extends LuisRecognizerBase {
    private _cache: { [key: string]: IIntentRecognizerResult } = {};

    public recognize(context: IRecognizeContext, callback: (error: Error, result: IIntentRecognizerResult) => void) {
        const key = context.message.text.toLowerCase();
        const cachedResult = this._cache[key];

        if (cachedResult) {
            callback(null, cachedResult);

            console.log(`'${key}' - from cache.`);
        } else {
            for (const predefinedCommnad of predefinedCommnads) {
                const regexp = new RegExp(predefinedCommnad.format);

                if (regexp.test(key)) {
                    const result = predefinedCommnad.resultCreator(predefinedCommnad.format, key);

                    callback(null, result);

                    console.log('Predefined command:');
                    console.dir(result);

                    return;
                }
            }

            super.recognize(context, (error: Error, result: IIntentRecognizerResult) => {
                console.dir(result);

                if (!error && result && (result.score >= 0.5)) {
                    this._cache[key] = result;
                }

                callback(error, result);
            });
        }
    }

    public onRecognize(context: IRecognizeContext, callback: (error: Error, result: IIntentRecognizerResult) => void) {
        super.onRecognize(context, (error: Error, result: IIntentRecognizerResult) => {
            if (result && (result.intent != 'None') && (result.score < 0.5)) {
                result.intent = 'None';
                result.score = 1;
            }

            callback(error, result);
        });
    }
}