import { CloudFormationServer, CloudFormationServerProps } from '@christou-lsp-test/aws-lsp-cloudformation'
import { httpsUtils } from '@christou-lsp-test/aws-lsp-core'
import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'

const connection = createConnection(ProposedFeatures.all)

let cfnSchema: string | undefined

const props: CloudFormationServerProps = {
    connection,
    defaultSchemaUri: CloudFormationServer.jsonSchemaUrl,
    schemaProvider: async (uri: string) => {
        switch (uri) {
            case CloudFormationServer.jsonSchemaUrl:
                if (!cfnSchema) {
                    cfnSchema = await getFileAsync(uri)
                }
                return cfnSchema
            default:
                throw new Error(`Unknown schema '${uri}'.`)
        }
    },
}

async function getFileAsync(url: string): Promise<string> {
    return await httpsUtils.requestContent(url)
}

export const server = new CloudFormationServer(props)
