import { JsonSchemaServer, JsonSchemaServerProps } from '@christou-lsp-test/aws-lsp-json-common'

export type BuildspecServerProps = Omit<JsonSchemaServerProps, 'defaultSchemaUri'>

export class BuildspecServer extends JsonSchemaServer {
    public static readonly jsonSchemaUrl: string =
        'https://d3rrggjwfhwld2.cloudfront.net/CodeBuild/buildspec/buildspec-standalone.schema.json'

    constructor(props: BuildspecServerProps) {
        super({
            defaultSchemaUri: BuildspecServer.jsonSchemaUrl,
            ...props,
        })
    }
}
