using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OperacaoController : ControllerBase
    {
        private readonly OperacaoService _operacaoService;

        public OperacaoController(OperacaoService operacaoService)
        {
            _operacaoService = operacaoService;
        }

        // Rota para obter todas as operações ativas e não deletadas
        [HttpGet]
        public async Task<IActionResult> GetOperacoes()
        {
            var operacoes = await _operacaoService.GetOperacoesAsync();
            return Ok(operacoes);
        }

        // Rota para criar uma nova operação
        [HttpPost]
        public async Task<IActionResult> CreateOperacao([FromBody] OperationProcessModel operacao)  // Alterado para OperationProcessModel
        {
            if (operacao == null || string.IsNullOrWhiteSpace(operacao.OperationQuantity.ToString()) || string.IsNullOrWhiteSpace(operacao.OperationDescription))
            {
                return BadRequest("Quantidade e descrição da operação são obrigatórias.");
            }

            var newOperacao = await _operacaoService.CreateOperacaoAsync(operacao);
            return Ok(new { success = true, message = "Operação criada com sucesso!", operacao = newOperacao });
        }

        // Rota para editar uma operação existente
        [HttpPut]
        public async Task<IActionResult> UpdateOperacao([FromBody] OperationProcessModel operacao)  // Alterado para OperationProcessModel
        {
            if (operacao == null || operacao.Id <= 0)
            {
                return BadRequest("Operação inválida.");
            }

            var updatedOperacao = await _operacaoService.UpdateOperacaoAsync(operacao);

            if (updatedOperacao == null)
            {
                return NotFound(new { success = false, message = "Operação não encontrada." });
            }

            return Ok(new { success = true, message = "Operação editada com sucesso!", operacao = updatedOperacao });
        }

        // Rota para excluir (marcar como deletada) uma operação
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOperacao(int id)
        {
            var isDeleted = await _operacaoService.DeleteOperacaoAsync(id);

            if (!isDeleted)
            {
                return NotFound(new { success = false, message = "Operação não encontrada." });
            }

            return Ok(new { success = true, message = "Operação excluída com sucesso!" });
        }
    }
}
