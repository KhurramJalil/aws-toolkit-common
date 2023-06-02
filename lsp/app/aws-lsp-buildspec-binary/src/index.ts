import { BuildspecServer, BuildspecServerProps } from '@christou-lsp-test/aws-lsp-buildspec'
import { httpsUtils } from '@christou-lsp-test/aws-lsp-core'
import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'

const connection = createConnection(ProposedFeatures.all)

let buildSpecSchema: string | undefined

const props: BuildspecServerProps = {
    connection,
    defaultSchemaUri: BuildspecServer.jsonSchemaUrl,
    schemaProvider: async (uri: string) => {
        switch (uri) {
            case BuildspecServer.jsonSchemaUrl:
                if (!buildSpecSchema) {
                    return await getFileAsync(uri)
                }
                return buildSpecSchema
            default:
                throw new Error(`Unknown schema '${uri}'.`)
        }
    },
}

async function getFileAsync(url: string): Promise<string> {
    return await httpsUtils.requestContent(url)
}

export const server = new BuildspecServer(props)
