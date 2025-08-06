using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<QualityCertificateModel> QualityCertificates { get; set; }
        public DbSet<OperationProcessModel> Operacao { get; set; }  // Tabela Operacao          public DbSet<ClienteModel> Cliente { get; set; }
        public DbSet<ClienteModel> Cliente { get; set; }    // Tabela Cliente
        public DbSet<NormaModel> TechnicalStandards { get; set; }

    }
}