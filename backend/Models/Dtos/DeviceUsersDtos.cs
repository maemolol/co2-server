namespace Dtos;

public sealed class DeviceUsersRequestDto
{
    public string device_mac {get; init;} = default!;
    public Guid user_id {get; init;}
}

public sealed class DeviceUsersResponseDto
{
    public Guid id {get; init;}
    public string? hash {get; init;}
}