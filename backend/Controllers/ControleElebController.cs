// Controllers/ControleElebController.cs
using System.Threading.Tasks;
using backend.Models;
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
    }
}