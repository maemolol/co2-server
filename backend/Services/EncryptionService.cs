using System.Security.Cryptography;
using System.Text;

public static class EncryptionService
{
    private static readonly string encKey = Environment.GetEnvironmentVariable("ENCRYPTION_KEY") ?? "62488f94ef0f5ede0f98e76c4427b897b578d910bcea3db3eefcefcde06d55e3";
    public static string Encrypt (string? plainInput)
    {
        if (string.IsNullOrWhiteSpace(plainInput))
            return null;

        using var aes256 = Aes.Create();
        aes256.Key = Encoding.UTF8.GetBytes(encKey);
        aes256.GenerateIV();

        using var encryptor = aes256.CreateEncryptor(aes256.Key, aes256.IV);
        using var memstream = new MemoryStream();
        memstream.Write(aes256.IV, 0, aes256.IV.Length);
        using var cryptstream = new CryptoStream(memstream, encryptor, CryptoStreamMode.Write);
        using var swriter = new StreamWriter(cryptstream);
        swriter.Write(plainInput);
        swriter.Flush();
        cryptstream.FlushFinalBlock();

        return Convert.ToBase64String(memstream.ToArray());
    }
}