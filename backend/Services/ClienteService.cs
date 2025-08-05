using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ClienteService
    {
        private readonly AppDbContext _context;

        public ClienteService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todos os clientes não deletados
        public async Task<List<ClienteModel>> GetClientesAsync()
        {
            return await _context.Cliente  // Referência para a tabela Cliente
                .Where(c => !c.IsDeleted)
                .ToListAsync();
        }

        // Criar um novo cliente
        public async Task<ClienteModel> CreateClienteAsync(ClienteModel cliente)
        {
            cliente.CreateDate = DateTime.Now;
            cliente.IsDeleted = false;
            _context.Cliente.Add(cliente);  // Adicionando o novo cliente na tabela
            await _context.SaveChangesAsync();
            return cliente;
        }

        // Editar um cliente existente
        public async Task<ClienteModel> UpdateClienteAsync(ClienteModel cliente)
        {
            var existingCliente = await _context.Cliente.FindAsync(cliente.Id);  // Procurando o cliente pelo ID

            if (existingCliente == null)
            {
                return null; // Cliente não encontrado
            }

            existingCliente.Cliente = cliente.Cliente;  // Atualizando o nome do cliente
            existingCliente.LastUpdate = DateTime.Now;  // Atualizando a data de modificação

            _context.Cliente.Update(existingCliente);  // Atualizando no banco
            await _context.SaveChangesAsync();
            return existingCliente;
        }

        // Excluir um cliente (marcando como deletado)
        public async Task<bool> DeleteClienteAsync(int id)
        {
            var cliente = await _context.Cliente.FindAsync(id);  // Encontrando o cliente pelo ID

            if (cliente == null)
            {
                return false; // Cliente não encontrado
            }

            cliente.IsDeleted = true;  // Marcando como deletado
            _context.Cliente.Update(cliente);  // Atualizando no banco
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
