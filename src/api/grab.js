import { createWriteStream, existsSync, copyFileSync } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import Pkg from './../../package.json' with { type: 'json' };

const DownloadSchema = async (src, dest) => {
    const stream = createWriteStream(dest);
    const { body } = await fetch(src);
    return finished(Readable.fromWeb(body).pipe(stream));
}

if (existsSync('src/api/schema.override')) {
    copyFileSync('src/api/schema.override', 'src/api/tgs_schema.graphql');
} else {
    await DownloadSchema(`https://github.com/tgstation/tgstation-server/releases/download/graphql-v${Pkg.tgs_graphql_api_version}/tgs-api.graphql`, 'src/api/tgs_schema.graphql');
}

await DownloadSchema('https://docs.github.com/public/fpt/schema.docs.graphql', 'src/api/github_schema.graphql');
