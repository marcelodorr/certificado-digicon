// 3. ConfigController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using certificado_digicon.Models;
using System.IO;

namespace certificado_digicon.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("salvarCaminho")]
        public IActionResult SalvarCaminho([FromBody] CertificadoPathConfig config)
        {
            var caminho = config.Path;
            var pathArquivo = Path.Combine("config", "cert_path.txt");

            Directory.CreateDirectory("config");
            System.IO.File.WriteAllText(pathArquivo, caminho);
            return Ok(new { success = true });
        }

        [HttpGet("obterCaminho")]
        public IActionResult ObterCaminho()
        {
            var pathArquivo = Path.Combine("config", "cert_path.txt");
            if (System.IO.File.Exists(pathArquivo))
            {
                var caminho = System.IO.File.ReadAllText(pathArquivo);
                return Ok(new { path = caminho });
            }
            return NotFound();
        }
    }
}