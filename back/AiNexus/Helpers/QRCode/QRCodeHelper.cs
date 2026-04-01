using QRCoder;

namespace AiNexus.Helpers.QRCode;

public static class QrCodeHelper
{
    public static string GenerateQrCodeBase64(string text)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(data);
        byte[] qrBytes = qrCode.GetGraphic(20);

        return Convert.ToBase64String(qrBytes);
    }
}