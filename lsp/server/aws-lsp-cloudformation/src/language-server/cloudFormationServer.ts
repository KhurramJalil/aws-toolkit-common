import { SchemaProvider, textDocumentUtils } from '@christou-lsp-test/aws-lsp-core'
import { JsonLanguageServiceWrapper } from '@christou-lsp-test/aws-lsp-json-common'
import { YamlLanguageServiceWrapper } from '@christou-lsp-test/aws-lsp-yaml-common'
import {
    Connection,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind,
    TextDocuments,
} from 'vscode-languageserver'
import { TextDocument } from 'vscode-languageserver-textdocument'

export type CloudFormationServerProps = {
    connection: Connection
    defaultSchemaUri: string
    schemaProvider: SchemaProvider
}

export class CloudFormationServer {
    public static readonly jsonSchemaUrl: string =
        'https://raw.githubusercontent.com/aws/serverless-application-model/main/samtranslator/schema/schema.json'

    public static readonly serverId = 'aws-lsp-cloudformation'

    protected documents = new TextDocuments(TextDocument)

    protected jsonService: JsonLanguageServiceWrapper
    protected yamlService: YamlLanguageServiceWrapper

    protected connection: Connection

    constructor(private readonly props: CloudFormationServerProps) {
        this.connection = props.connection

        this.jsonService = new JsonLanguageServiceWrapper(props)
        this.yamlService = new YamlLanguageServiceWrapper({
            displayName: CloudFormationServer.serverId,
            ...props,
        })

        this.connection.onInitialize((params: InitializeParams) => {
            // this.options = params;
            const result: InitializeResult = {
                // serverInfo: initialisationOptions?.serverInfo,
                capabilities: {
                    textDocumentSync: {
                        openClose: true,
                        change: TextDocumentSyncKind.Incremental,
                    },
                    completionProvider: { resolveProvider: true },
                    hoverProvider: true,
                    documentFormattingProvider: true,
                    // ...(initialisationOptions?.capabilities || {}),
                },
            }
            return result
        })
        this.registerHandlers()
        this.documents.listen(this.connection)
        this.connection.listen()

        this.connection.console.info('AWS CloudFormation (json/yaml) language server started!')
    }

    getTextDocument(uri: string): TextDocument {
        const textDocument = this.documents.get(uri)

        if (!textDocument) {
            throw new Error(`Document with uri ${uri} not found.`)
        }

        return textDocument
    }

    async validateDocument(uri: string): Promise<void> {
        const textDocument = this.getTextDocument(uri)

        this.connection.console.info(`Validating document, languageId: ${textDocument.languageId}, uri: ${uri}...`)

        if (JsonLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
            const diagnostics = await this.jsonService.doValidation(textDocument)
            this.connection.sendDiagnostics({ uri, version: textDocument.version, diagnostics })
        } else if (YamlLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
            const diagnostics = await this.yamlService.doValidation(textDocument)
            this.connection.sendDiagnostics({ uri, version: textDocument.version, diagnostics })
        }

        return
    }

    registerHandlers() {
        this.documents.onDidOpen(({ document }) => {
            this.connection.console.info(`Document opened, uri: ${document.uri}...`)

            this.validateDocument(document.uri)
        })

        this.documents.onDidChangeContent(({ document }) => {
            this.validateDocument(document.uri)
        })

        this.connection.onCompletion(async ({ textDocument: requestedDocument, position }) => {
            const textDocument = this.getTextDocument(requestedDocument.uri)

            if (JsonLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                const results = await this.jsonService.doComplete(textDocument, position)

                // if (results!!) {
                //     completionItemUtils.prependItemDetail(results.items, CloudFormationServer.serverId)
                // }

                return results
            } else if (YamlLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                const results = await this.yamlService.doComplete(textDocument, position)

                // completionItemUtils.prependItemDetail(results.items, CloudFormationServer.serverId)

                return results
            }

            return
        })

        this.connection.onCompletionResolve(item => item)

        this.connection.onHover(async ({ textDocument: requestedDocument, position }) => {
            const textDocument = this.getTextDocument(requestedDocument.uri)

            this.connection.console.info(`Hover, languageId: ${textDocument.languageId}, uri: ${textDocument.uri}...`)

            if (JsonLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                return await this.jsonService.doHover(textDocument, position)
            } else if (YamlLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                return await this.yamlService.doHover(textDocument, position)
            }

            return
        })

        this.connection.onDocumentFormatting(async ({ textDocument: requestedDocument, options }) => {
            const textDocument = this.getTextDocument(requestedDocument.uri)

            if (JsonLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                return this.jsonService.format(textDocument, textDocumentUtils.getFullRange(textDocument), options)
            } else if (YamlLanguageServiceWrapper.isLangaugeIdSupported(textDocument.languageId) === true) {
                // todo : convert options to CustomFormatterOptions
                return this.yamlService.doFormat(textDocument, {})
            }

            return
        })
    }
}
