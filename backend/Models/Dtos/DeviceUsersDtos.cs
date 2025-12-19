namespace Dtos;

public sealed class DeviceUsersRequestDto
{
    public string device_mac {get; init;} = default!;
    public string username {get; init;} = default!;
    public string password {get; init;} = default!;
    //public Guid user_id {get; init;}
}

public sealed class DeviceUsersResponseDto
{
    public Boolean enrolled {get; init;}
    public string? key {get; init;}
}