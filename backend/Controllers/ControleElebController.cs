// Controllers/ControleElebController.cs
using System.Threading.Tasks;
using backend.Models;
using backend.Requests;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ControleElebController : ControllerBase
    {
        private readonly ControleElebService _service;

        public ControleElebController(ControleElebService service)
        {
            _service = service;
        }

        [HttpGet("ordens-finalizadas")]
        public async Task<IActionResult> GetOrdensFinalizadas()
        {
            var result = await _service.GetOrdensFinalizadasAsync();
            return Ok(result);
        }

        [HttpGet("{opEleb}")]
        public async Task<IActionResult> GetByOp(string opEleb)
        {
            var item = await _service.GetByOpAsync(opEleb);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        [HttpPut("liberar")]
        public async Task<IActionResult> Liberar([FromBody] LiberarOrdemRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.OpEleb) ||
                string.IsNullOrWhiteSpace(req?.NumeroCertificado))
            {
                return BadRequest(new { message = "OpEleb e NumeroCertificado são obrigatórios." });
            }

            var ok = await _service.LiberarAsync(req.OpEleb, req.NumeroCertificado);
            if (!ok)
                return NotFound(new { message = "OP não encontrada (ou situação inválida)." });

            return Ok(new { success = true, message = "OP liberada com sucesso." });
        }
    }
}