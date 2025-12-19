using Models;
using System.Text.Json.Serialization;
namespace Dtos;

public class DeviceRegisterDto
{
  [JsonPropertyName("device_mac")]
  public string DeviceMac { get; set; } = null!;

  [JsonPropertyName("name")]
  public string? Name { get; set; }

  [JsonPropertyName("location")]
  public string? Location { get; set; }

  [JsonPropertyName("registered_at")]
  public DateTime RegisteredAt { get; set; }

  [JsonPropertyName("user_id")]
  public Guid UserId { get; set; }
}

public class DeviceOutDto
{
  [JsonPropertyName("device_mac")]
  public string DeviceMac { get; init; } = default!;
  public string? name {get; init; }
  public string? location { get; init; }

  [JsonPropertyName("registered_at")]
  public DateTime RegisteredAt { get; init; }

  [JsonPropertyName("user_id")]
  public Guid UserId { get; init; }

  public static DeviceOutDto FromEntity(Devices d) => new()
  {
    DeviceMac = d.device_mac!,
    name = d.name,
    location = d.location,
    RegisteredAt = d.registered_at,
    UserId = d.user_id
  };
}