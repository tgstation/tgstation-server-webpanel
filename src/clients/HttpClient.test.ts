import HttpClient from './HttpClient';

async function testResponse(response: Promise<Response>): Promise<void> {
    const result = await response;
    expect(result.ok).toBe(true);
    const json = await result.json();
    expect(json).toBeDefined();
    expect(json.userId).toBe(1);
    expect(json.id).toBe(1);
    expect(json.title).toBe("delectus aut autem");
    expect(json.completed).toBe(false);
}

test('httpclient can fetch', async () => {
    const client = new HttpClient("https://jsonplaceholder.typicode.com/");
    await testResponse(client.runRequest("todos/1"));
});

test('httpclient can with explicit route', async () => {
    const client = new HttpClient("https://dextraspace.net/");
    await testResponse(client.runRequest("https://jsonplaceholder.typicode.com/todos/1", null, true));
});
