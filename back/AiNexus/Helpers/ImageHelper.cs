using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;


namespace AiNexus.Helpers;

public static class ImageHelper {
    public static string ToPreviewBase64(
        string base64,
        int maxWidth = 100,
        int quality = 50) {
        if (string.IsNullOrWhiteSpace(base64))
            return base64;

        byte[] bytes;
        try {
            bytes = Convert.FromBase64String(base64);
        } catch {
            return base64;
        }

        using var image = Image.Load<Rgba32>(bytes);

        if (image.Width <= maxWidth)
            return base64;

        int newHeight = image.Height * maxWidth / image.Width;

        image.Mutate(x => x.Resize(maxWidth, newHeight));

        using var output = new MemoryStream();

        image.Save(output, new JpegEncoder {
            Quality = quality
        });

        return Convert.ToBase64String(output.ToArray());
    }
}