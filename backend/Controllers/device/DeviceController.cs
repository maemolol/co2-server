using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("/devices")]
public class DeviceController : ControllerBase
{
    private readonly AppDbContext context;
}