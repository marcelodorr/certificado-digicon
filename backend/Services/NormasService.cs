// Services/NormasService.cs
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public class NormasService
    {
        private readonly AppDbContext _context;

        public NormasService(AppDbContext context)
        {
            _context = context;
        }

      
    }
}