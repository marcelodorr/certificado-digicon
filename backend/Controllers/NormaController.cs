using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NormaController : ControllerBase
    {
        private readonly NormaService _normaService;

        public NormaController(NormaService normaService)
        {
            _normaService = normaService;
        }

        // Rota para obter todas as normas
        [HttpGet("todas")]
        public async Task<IActionResult> GetNormas()
        {
            var normas = await _normaService.GetNormasAsync();
            return Ok(normas);
        }

        // Rota para criar uma nova norma
        [HttpPost]
        public async Task<IActionResult> CreateNorma([FromBody] NormaModel norma)
        {
            if (norma == null || string.IsNullOrWhiteSpace(norma.PartNumber))
            {
                return BadRequest("PartNumber é obrigatório.");
            }

            var newNorma = await _normaService.CreateNormaAsync(norma);
            return Ok(new { success = true, message = "Norma criada com sucesso!", norma = newNorma });
        }

        // Rota para atualizar uma norma existente
        [HttpPut]
        public async Task<IActionResult> UpdateNorma([FromBody] NormaModel norma)
        {
            if (norma == null || norma.Id <= 0)
            {
                return BadRequest("Norma inválida.");
            }

            var updatedNorma = await _normaService.UpdateNormaAsync(norma);

            if (updatedNorma == null)
            {
                return NotFound(new { success = false, message = "Norma não encontrada." });
            }

            return Ok(new { success = true, message = "Norma atualizada com sucesso!", norma = updatedNorma });
        }

        // Rota para excluir uma norma (marcando como deletada)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNorma(int id)
        {
            var isDeleted = await _normaService.DeleteNormaAsync(id);

            if (!isDeleted)
            {
                return NotFound(new { success = false, message = "Norma não encontrada." });
            }

            return Ok(new { success = true, message = "Norma excluída com sucesso!" });
        }
    }
}
