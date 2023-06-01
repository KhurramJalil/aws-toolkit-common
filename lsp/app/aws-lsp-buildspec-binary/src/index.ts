import { ProposedFeatures, createConnection } from 'vscode-languageserver/node'

import * as https from 'https'

import { BuildspecServer, BuildspecServerProps } from '@christou-lsp-test/aws-lsp-buildspec'

const connection = createConnection(ProposedFeatures.all)

const props: BuildspecServerProps = {
    connection,
    schemaRequestService: async (uri: string) => {
        switch (uri) {
            case BuildspecServer.jsonSchemaUrl:
                return await getFileAsync(uri)
            default:
                throw new Error(`Unknown schema '${uri}'.`)
        }
    },
}

function getRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            // Handle the response
            const statusCode = response.statusCode
            if (statusCode !== 200) {
                reject(new Error(`Request failed with status code ${statusCode}`))
                response.resume()
                return
            }

            let rawData = ''
            response.setEncoding('utf8')

            response.on('data', chunk => {
                rawData += chunk
            })

            response.on('end', () => {
                // File download completed
                resolve(rawData)
            })
        })

        request.on('error', error => {
            reject(error)
        })
    })
}

async function getFileAsync(url: string): Promise<string> {
    return await getRequest(url)
}

export const server = new BuildspecServer(props)
