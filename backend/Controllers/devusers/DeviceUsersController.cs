using Microsoft.AspNetCore.Mvc;
using Dtos;
using Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Controllers;

[ApiController]
[Route("/devusers")]
public class DeviceUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public DeviceUsersController(AppDbContext context) => _context = context;

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

    [HttpPost("enroll")]
    public async Task<IActionResult> Enroll(DeviceUsersRequestDto request)
    {
        if(request == null) return BadRequest(new {error = "Body required."});
        if(request.user_id == Guid.Empty) return BadRequest(new {error = "User ID required."});
        if(string.IsNullOrEmpty(request.device_mac)) return BadRequest(new {error = "Device MAC required"});

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

        var existing = await _context.DeviceUsers.FirstOrDefaultAsync(du => du.device_mac == mac && du.user_id == request.user_id);
        if(existing != null) return Conflict(new {error = "Device already enrolled with user."});

        var key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(25));
        var encHash = BCrypt.Net.BCrypt.HashPassword(key);

        var devuser = new DeviceUsers {device_mac = mac, user_id = request.user_id, hash = encHash};
        _context.DeviceUsers.Add(devuser);
        await _context.SaveChangesAsync();

        return Ok(new DeviceUsersResponseDto{id = devuser.id, hash = encHash});
    }
}