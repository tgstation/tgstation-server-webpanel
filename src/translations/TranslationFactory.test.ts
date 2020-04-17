import Locales from './Locales';
import TranslationFactory from './TranslationFactory';

import IHttpClient from '../helpers/IHttpClient';

class FakeClient implements IHttpClient {
    public do404: number;
    public lastRequestPath: string;

    public runRequest(
        url: string,
        requestInfo?: RequestInit
    ): Promise<Response> {
        let response: Response;

        if (this.do404 > 0) {
            --this.do404;
            response = new Response(null, { status: 404 });
        } else response = new Response('{"sample.key":"sample text"}');

        this.lastRequestPath = url;

        return Promise.resolve<Response>(response);
    }
}

const fakeClient = new FakeClient();

const translationFactory = new TranslationFactory(fakeClient);

it('loads english translation properly', async () => {
    const translation = await translationFactory.loadTranslation(Locales.enCA);
    expect(translation.locale).toBe(Locales.enCA);
    expect(translation.messages['sample.key']).toBe('sample text');
    expect(fakeClient.lastRequestPath).toBe(
        '/locales/' + Locales.enCA + '.json'
    );
});

it('tries multiple times to load a simpler locale', async () => {
    fakeClient.do404 = 1;
    const translation = await translationFactory.loadTranslation(Locales.enCA);
    expect(translation.locale).toBe(Locales.en);
    expect(translation.messages['sample.key']).toBe('sample text');
    expect(fakeClient.do404).toBe(0);
});

it('throws when the response 404s', async () => {
    fakeClient.do404 = 2;
    try {
        await translationFactory.loadTranslation(Locales.enCA);
        expect(true).toBeFalsy();
    } catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
    expect(fakeClient.do404).toBe(0);
    expect(fakeClient.lastRequestPath).toBe('/locales/' + Locales.en + '.json');
});
