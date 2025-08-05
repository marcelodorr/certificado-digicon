using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using backend.Models; // Importando o namespace onde CreateUserRequest está
using System.Security.Cryptography; // Para Rfc2898DeriveBytes
using System.Text; // Para Encoding.UTF8
using System; // Para Convert

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

        // Rota para criar um novo usuário
        [HttpPost("create")]
        public IActionResult CreateUser([FromBody] CreateUserRequest createUserRequest)
        {
            if (string.IsNullOrWhiteSpace(createUserRequest.Username) || string.IsNullOrWhiteSpace(createUserRequest.Password))
            {
                return BadRequest(new { success = false, message = "Username e Password são obrigatórios." });
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Verificar se o nome de usuário já existe
                string checkUserSql = "SELECT COUNT(*) FROM login_certification WHERE Username = @Username";
                using (var command = new SqlCommand(checkUserSql, connection))
                {
                    command.Parameters.AddWithValue("@Username", createUserRequest.Username);
                    int userExists = (int)command.ExecuteScalar();

                    if (userExists > 0)
                    {
                        return Conflict(new { success = false, message = "Nome de usuário já existe." });
                    }
                }

                // Gerar o salt para a senha
                using (var rng = new RNGCryptoServiceProvider())
                {
                    byte[] salt = new byte[16]; // Tamanho do salt
                    rng.GetBytes(salt);

                    // Gerar o hash da senha com o salt
                    using (var pbkdf2 = new Rfc2898DeriveBytes(createUserRequest.Password, salt, 10000))
                    {
                        byte[] passwordHash = pbkdf2.GetBytes(32); // Tamanho do hash, pode ser ajustado

                        // Converter o hash e salt para Base64
                        string passwordHashBase64 = Convert.ToBase64String(passwordHash);
                        string saltBase64 = Convert.ToBase64String(salt);

                        // Inserir o usuário e senha no banco de dados
                        string sql = @"
                            INSERT INTO login_certification (Username, Password, Salt)
                            VALUES (@Username, @Password, @Salt)
                        ";

                        using (var command = new SqlCommand(sql, connection))
                        {
                            command.Parameters.AddWithValue("@Username", createUserRequest.Username);
                            command.Parameters.AddWithValue("@Password", passwordHashBase64);
                            command.Parameters.AddWithValue("@Salt", saltBase64);

                            int rowsAffected = command.ExecuteNonQuery();

                            if (rowsAffected > 0)
                            {
                                return Ok(new { success = true, message = "Usuário criado com sucesso!" });
                            }
                            else
                            {
                                return StatusCode(500, new { success = false, message = "Erro ao criar o usuário." });
                            }
                        }
                    }
                }
            }
        }

        // Rota de autenticação existente
        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody] LoginRequest login)
        {
            if (string.IsNullOrWhiteSpace(login.User) || string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest(new { success = false, message = "Username e Password são obrigatórios." });
            }

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();

                string sql = @"
                    SELECT [Password], [Salt]
                    FROM login_certification 
                    WHERE [Username] = @user
                ";

                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@user", login.User);

                    using (var reader = command.ExecuteReader())
                    {
                        if (!reader.Read())
                            return NotFound(new { success = false, message = "Usuário não encontrado." });

                        string passwordHashBase64 = reader["Password"].ToString();
                        string saltBase64 = reader["Salt"].ToString();

                        // Convertendo o salt de base64 para byte[]
                        byte[] salt = Convert.FromBase64String(saltBase64);

                        // Aplicando o salt e gerando o hash da senha
                        using (var pbkdf2 = new Rfc2898DeriveBytes(login.Password, salt, 10000))
                        {
                            byte[] computedHash = pbkdf2.GetBytes(32); // Tamanho do hash, pode ser ajustado

                            // Comparando o hash gerado com o armazenado
                            byte[] storedHash = Convert.FromBase64String(passwordHashBase64);

                            if (computedHash.SequenceEqual(storedHash))
                                return Ok(new { success = true });
                            else
                                return Unauthorized(new { success = false, message = "Credenciais inválidas." });
                        }
                    }
                }
            }
        }
    }
}
