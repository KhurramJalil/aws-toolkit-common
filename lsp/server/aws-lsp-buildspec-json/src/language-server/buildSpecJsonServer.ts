import { JsonSchemaServer, JsonSchemaServerProps } from '@christou-lsp-test/aws-lsp-json-common'

export type BuildspecJsonServerProps = Omit<JsonSchemaServerProps, 'defaultSchemaUri'>

export class BuildspecJsonServer extends JsonSchemaServer {
    // TODO : This might need a "buildspec common" or something
    public static readonly jsonSchemaUrl: string =
        'https://d3rrggjwfhwld2.cloudfront.net/CodeBuild/buildspec/buildspec-standalone.schema.json'

    constructor(props: BuildspecJsonServerProps) {
        super({
            defaultSchemaUri: BuildspecJsonServer.jsonSchemaUrl,
            ...props,
        })
    }
}
