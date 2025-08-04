// Services/QualityCertificateService.cs
using backend.Data;
using backend.Models;
using System.Text.Json;

namespace backend.Services
{
    public class QualityCertificateService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public QualityCertificateService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public QualityCertificate Add(QualityCertificate cert)
        {
            cert.CreateDate = DateTime.Now;
            _context.QualityCertificates.Add(cert);
            _context.SaveChanges();
            return cert;
        }

        public int GetLastCertNumber()
        {
            return _context.QualityCertificates
                .OrderByDescending(q => q.Id)
                .Select(q => q.NumeroCertificado)
                .FirstOrDefault();
        }
    }
}