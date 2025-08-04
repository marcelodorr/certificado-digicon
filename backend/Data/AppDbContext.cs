using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<QualityCertificate> QualityCertificates { get; set; }
        public DbSet<CadNorma> CadNormas { get; set; }
        public DbSet<Operacao> Operacoes { get; set; }
        public DbSet<Login> Logins { get; set; }
    }
}
