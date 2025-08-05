using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private readonly ClienteService _clienteService;

        public ClienteController(ClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        // Rota para obter todos os clientes não deletados
        [HttpGet]
        public async Task<IActionResult> GetClientes()
        {
            var clientes = await _clienteService.GetClientesAsync();
            return Ok(clientes);
        }

        // Rota para criar um novo cliente
        [HttpPost]
        public async Task<IActionResult> CreateCliente([FromBody] ClienteModel cliente)
        {
            if (cliente == null || string.IsNullOrWhiteSpace(cliente.Cliente))  // Verificando se o nome do cliente foi informado
            {
                return BadRequest("Nome do cliente é obrigatório.");
            }

            var newCliente = await _clienteService.CreateClienteAsync(cliente);
            return Ok(new { success = true, message = "Cliente criado com sucesso!", cliente = newCliente });
        }

        // Rota para editar um cliente existente
        [HttpPut]
        public async Task<IActionResult> UpdateCliente([FromBody] ClienteModel cliente)
        {
            if (cliente == null || cliente.Id <= 0)
            {
                return BadRequest("Cliente inválido.");
            }

            var updatedCliente = await _clienteService.UpdateClienteAsync(cliente);

            if (updatedCliente == null)
            {
                return NotFound(new { success = false, message = "Cliente não encontrado." });
            }

            return Ok(new { success = true, message = "Cliente editado com sucesso!", cliente = updatedCliente });
        }

        // Rota para excluir (marcar como deletado) um cliente
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var isDeleted = await _clienteService.DeleteClienteAsync(id);

            if (!isDeleted)
            {
                return NotFound(new { success = false, message = "Cliente não encontrado." });
            }

            return Ok(new { success = true, message = "Cliente excluído com sucesso!" });
        }
    }
}
