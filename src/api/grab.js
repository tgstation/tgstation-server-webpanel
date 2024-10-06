import { createWriteStream, existsSync, copyFileSync } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import Pkg from './../../package.json' with { type: 'json' };

if (existsSync('src/api/schema.override')) {
    copyFileSync('src/api/schema.override', 'src/api/schema.graphql');
} else {
    const stream = createWriteStream('src/api/schema.graphql');
    const { body } = await fetch(`https://github.com/tgstation/tgstation-server/releases/graphql-v${Pkg.tgs_graphql_api_version}/tgs-api.graphql`);
    await finished(Readable.fromWeb(body).pipe(stream));
}
