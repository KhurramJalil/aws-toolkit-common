import { JsonSchemaServer } from '@christou-lsp-test/aws-lsp-json-common'
import { YamlSchemaServerProps } from '@christou-lsp-test/aws-lsp-yaml-common'

export type BuildspecYamlServerProps = Omit<YamlSchemaServerProps, 'defaultSchemaUri'>

export class BuildspecYamlServer extends JsonSchemaServer {
    // TODO : This might need a "buildspec common" or something
    public static readonly jsonSchemaUrl: string =
        'https://d3rrggjwfhwld2.cloudfront.net/CodeBuild/buildspec/buildspec-standalone.schema.json'

    constructor(props: BuildspecYamlServerProps) {
        super({
            defaultSchemaUri: BuildspecYamlServer.jsonSchemaUrl,
            ...props,
        })
    }
}
