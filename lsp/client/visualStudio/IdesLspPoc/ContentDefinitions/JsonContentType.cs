using Microsoft.VisualStudio.LanguageServer.Client;
using Microsoft.VisualStudio.Utilities;
using System.ComponentModel.Composition;

namespace IdesLspPoc.ContentDefinitions
{
    // This fuses JSON to our language server
    // JSON is sort of reserved by VS, this is the only way I found that activates our LSP and uses it with .json files
    public static class JsonContentType
    {
        // This also becomes the languageId provided to the language server
        public const string ContentTypeName = "christou-test-json";

        // Content type must derive from CodeRemoteContentTypeName
        // https://learn.microsoft.com/en-us/visualstudio/extensibility/adding-an-lsp-extension?view=vs-2022#content-type-definition
        [Export]
        [Name(ContentTypeName)]
        [BaseDefinition("JSON")]
        [BaseDefinition(CodeRemoteContentDefinition.CodeRemoteContentTypeName)]
        internal static ContentTypeDefinition JsonDefinition;

        [Export]
        [FileExtension(".json")]
        [ContentType(ContentTypeName)]
        internal static FileExtensionToContentTypeDefinition FileExtensionDefinition;
    }
}
