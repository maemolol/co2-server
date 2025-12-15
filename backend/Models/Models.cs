using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models;

public class User
{
    [Key]
    public Guid user_id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(256)]
    public string? username { get; set; }

    [JsonIgnore]
    [Required]
    public string? password_hash { get; set; }
}