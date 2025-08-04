// Services/OperacaoService.cs
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public class OperacaoService
    {
        private readonly AppDbContext _context;

        public OperacaoService(AppDbContext context)
        {
            _context = context;
        }

        public List<Operacao> GetOperacoes()
        {
            return _context.Operacoes.OrderBy(o => o.Id).ToList();
        }
    }
}