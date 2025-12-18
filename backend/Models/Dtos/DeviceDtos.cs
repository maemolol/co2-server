using Models;
namespace Dtos;

public class DeviceRegisterDto
{
    public string device_mac { get; set; } = default!;
    public string? name { get; set; }
    public string? location { get; set; }
    public DateTime registered_at { get; set; }
    public Guid user_id { get; set; }
}

public class DeviceOutDto
{
    public string device_mac { get; init; } = default!;
    public string? name {get; init; }
    public string? location { get; init; }
    public DateTime registered_at { get; init; }
    public Guid user_id { get; init; }

    public static DeviceOutDto FromEntity(Devices d) => new()
    {
      device_mac = d.device_mac!,
      name = d.name,
      location = d.location,
      registered_at = d.registered_at,
      user_id = d.user_id
    };
}