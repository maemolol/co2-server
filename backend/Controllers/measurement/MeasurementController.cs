using Models;
using Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        var errors = new Dictionary<string, string>();

        if(request == null) return BadRequest(new { error = "Body is required."});
        if(string.IsNullOrEmpty(request.device_mac)) errors["deviceMac"] = "Device MAC required.";
        if(request.user_id == Guid.Empty) errors["userId"] = "User ID is required.";
        if(request.device_users_id == Guid.Empty) errors["devuserId"] = "Device/user ID required.";
        if(request.co2 <= 0 || request.co2 > 10000) errors["co2"] = "Invalid CO2 value.";
        if(errors.Count > 0) return BadRequest(new {errors});

        try
        {
            var mac = NormaliseMac(request.device_mac);

            var device = await _context.Devices.FirstOrDefaultAsync(d => d.device_mac == mac);
            if(device == null)
            {
                device = new Devices
                {
                    device_mac = mac,
                    name = "Auto-registered",
                    location = "Unknown",
                    registered_at = DateTime.UtcNow,
                    user_id = request.user_id
                };
                _context.Devices.Add(device);
                await _context.SaveChangesAsync();
            }

            var link = request.device_users_id;
            
        } catch (Exception ex) {}
        
    }
}