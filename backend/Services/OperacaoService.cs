using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OperacaoService
    {
        private readonly AppDbContext _context;

        public OperacaoService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todas as operações ativas e não deletadas
        public async Task<List<OperationProcessModel>> GetOperacoesAsync()
        {
            return await _context.Operacao
                .Where(o => o.IsActivated && !o.IsDeleted)
                .ToListAsync();
        }

        // Criar uma nova operação
        public async Task<OperationProcessModel> CreateOperacaoAsync(OperationProcessModel operacao)
        {
            operacao.CreateDate = DateTime.Now;
            operacao.IsDeleted = false;
            _context.Operacao.Add(operacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return operacao;
        }

        // Editar uma operação existente
        public async Task<OperationProcessModel> UpdateOperacaoAsync(OperationProcessModel operacao)
        {
            var existingOperacao = await _context.Operacao.FindAsync(operacao.Id);  // Corrigido para OperationProcesses

            if (existingOperacao == null)
            {
                return null;  // Operação não encontrada
            }

            existingOperacao.OperationQuantity = operacao.OperationQuantity;
            existingOperacao.OperationDescription = operacao.OperationDescription;
            existingOperacao.LastUpdate = DateTime.Now;

            _context.Operacao.Update(existingOperacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return existingOperacao;
        }

        // Excluir uma operação (marcando como deletada)
        public async Task<bool> DeleteOperacaoAsync(int id)
        {
            var operacao = await _context.Operacao.FindAsync(id);  // Corrigido para OperationProcesses

            if (operacao == null)
            {
                return false;  // Operação não encontrada
            }

            operacao.IsDeleted = true;
            _context.Operacao.Update(operacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
