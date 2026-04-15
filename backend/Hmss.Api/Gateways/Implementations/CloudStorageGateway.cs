using Hmss.Api.Gateways.Interfaces;

namespace Hmss.Api.Gateways.Implementations;

public class CloudStorageGateway : ICloudStorageGateway
{
    private readonly IConfiguration _config;
    private readonly ILogger<CloudStorageGateway> _logger;
    private const int MaxImageFiles = 5;
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private const int MaxDocFiles = 3;
    private const long MaxDocBytes = 3 * 1024 * 1024;
    private static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png" };
    private static readonly string[] DocExtensions = { ".pdf", ".jpg", ".jpeg" };

    public CloudStorageGateway(IConfiguration config, ILogger<CloudStorageGateway> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<List<string>> UploadImagesAsync(IFormFileCollection images)
    {
        ValidateFiles(images, MaxImageFiles, MaxImageBytes, ImageExtensions);
        return await SaveFilesAsync(images, "images");
    }

    public async Task<List<string>> UploadDocumentsAsync(IFormFileCollection docs)
    {
        ValidateFiles(docs, MaxDocFiles, MaxDocBytes, DocExtensions);
        return await SaveFilesAsync(docs, "documents");
    }

    public Task<List<string>> RetrieveDocumentsAsync(List<string> documentRefs)
    {
        // For local storage, refs are already URLs
        return Task.FromResult(documentRefs);
    }

    private static void ValidateFiles(IFormFileCollection files, int maxCount, long maxBytes, string[] allowedExtensions)
    {
        if (files.Count > maxCount) throw new InvalidOperationException($"Maximum {maxCount} files allowed");
        foreach (var file in files)
        {
            if (file.Length > maxBytes) throw new InvalidOperationException($"File {file.FileName} exceeds size limit");
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext)) throw new InvalidOperationException($"File type {ext} not allowed");
        }
    }

    private async Task<List<string>> SaveFilesAsync(IFormFileCollection files, string subFolder)
    {
        var basePath = _config["CloudStorage:BasePath"] ?? "/tmp/hmss-uploads";
        var baseUrl = _config["CloudStorage:BaseUrl"] ?? "http://localhost:5000/uploads";
        var uploadDir = Path.Combine(basePath, subFolder);
        Directory.CreateDirectory(uploadDir);

        var urls = new List<string>();
        foreach (var file in files)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);
            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);
            urls.Add($"{baseUrl}/{subFolder}/{fileName}");
        }
        return urls;
    }
}
