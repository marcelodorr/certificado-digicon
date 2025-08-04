// 1. LoginController.cs
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using certificado_digicon.Models;

namespace certificado_digicon.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody] LoginRequest login)
        {
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            connection.Open();

            var command = new SqlCommand("SELECT COUNT(*) FROM login_certification WHERE [User] = @user AND [Password] = HASHBYTES('SHA2_256', @password)", connection);
            command.Parameters.AddWithValue("@user", login.User);
            command.Parameters.AddWithValue("@password", login.Password);

            int count = (int)command.ExecuteScalar();
            return count > 0 ? Ok(new { success = true }) : Unauthorized();
        }
    }
}

// 2. LoginRequest.cs
namespace certificado_digicon.Models
{
    public class LoginRequest
    {
        public string User { get; set; }
        public string Password { get; set; }
    }
}