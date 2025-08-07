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
    }
}