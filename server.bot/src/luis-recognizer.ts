import { LuisRecognizer as LuisRecognizerBase, IRecognizeContext, IIntentRecognizerResult } from 'botbuilder';
import { debug, error, debuglog } from 'util';

export class LuisRecognizer extends LuisRecognizerBase {
    private _cache: { [key: string]: IIntentRecognizerResult } = {};

    public recognize(context: IRecognizeContext, callback: (error: Error, result: IIntentRecognizerResult) => void) {
        const key = context.message.text.toLowerCase();
        const cachedResult = this._cache[key];

        if (cachedResult) {
            callback(null, cachedResult);

            console.log(`'${key}' - from cache.`);
        } else {
            super.recognize(context, (error: Error, result: IIntentRecognizerResult) => {
                if (!error && result) {
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