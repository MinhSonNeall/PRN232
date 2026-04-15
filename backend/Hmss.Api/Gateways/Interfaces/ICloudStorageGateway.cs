namespace Hmss.Api.Gateways.Interfaces;
public interface ICloudStorageGateway
{
    Task<List<string>> UploadImagesAsync(IFormFileCollection images);
    Task<List<string>> UploadDocumentsAsync(IFormFileCollection docs);
    Task<List<string>> RetrieveDocumentsAsync(List<string> documentRefs);
}
