using Models;
using Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("/")]
[Produces("application/json")]
public class MeasurementController : ControllerBase
{
    private readonly AppDbContext _context;

    public MeasurementController(AppDbContext context) => _context = context;

    private static string NormaliseMac(string address)
    {
        var orig_string = new string(address.Where(c => Uri.IsHexDigit(c)).ToArray()).ToUpperInvariant();
        if(orig_string.Length != 12) return address.Trim();
        return string.Create(17, orig_string, (span, src) =>
        {
            span[0] = src[0]; span[1] = src[1]; span[2] = ':';
            span[3] = src[2]; span[4] = src[3]; span[5] = ':';
            span[6] = src[4]; span[7] = src[5]; span[8] = ':';
            span[9] = src[6]; span[10] = src[7]; span[11] = ':';
            span[12] = src[8]; span[13] = src[9]; span[14] = ':';
            span[15] = src[10]; span[16] = src[11];
        });
    }

    [HttpPost("measure")]
    public async Task<IActionResult> GetMeasurements([FromBody] MeasurementInDto request)
    {
        
    }
}