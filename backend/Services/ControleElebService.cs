// Services/ControleElebService.cs
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ControleElebService
    {
        private readonly AppDbContext _context;

        public ControleElebService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ControleEleb>> GetOrdensFinalizadasAsync()
        {
            return await _context.ControleElebs
                .Where(c => c.Situacao == "Finalizado")
                .ToListAsync();
        }

        public async Task<ControleEleb> GetByOpAsync(string opEleb)
        {
            return await _context.ControleElebs
                .Where(c => c.Situacao == "Finalizado" && c.OpEleb == opEleb)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> LiberarAsync(string opEleb, string numeroCertificado)
        {
            // Busca a OP
            var ordem = await _context.ControleElebs
                .FirstOrDefaultAsync(x => x.OpEleb == opEleb);

            if (ordem == null) return false;

            // Opcional: só permitir se estava 'Finalizado'
            if (!string.Equals(ordem.Situacao, "Finalizado")) return false;

            ordem.Situacao = "Liberado";
            ordem.NumCertificado = numeroCertificado;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LiberarPorIdAsync(int id, string numeroCertificado)
        {
            var ordem = await _context.ControleElebs.FirstOrDefaultAsync(x => x.ID == id);
            if (ordem == null) return false;

            // Se você quiser restringir somente quando Finalizado:
            if (!string.Equals(ordem.Situacao, "Finalizado", StringComparison.OrdinalIgnoreCase))
                return false;

            ordem.Situacao = "Liberado";
            ordem.NumCertificado = numeroCertificado;
            // se existir DataLiberacao:
            // ordem.DataLiberacao ??= DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}