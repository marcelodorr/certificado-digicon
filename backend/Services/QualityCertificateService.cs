// Services/QualityCertificateService.cs
using backend.Data;
using backend.Models;
using System.Text.Json;
using Microsoft.Data.SqlClient;


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
            DateTime now = DateTime.Now;
            string anoAtual = now.Year.ToString().Substring(2); // Ex: "2025"
            int proximoNumero = 1;

            var ultimoCert = _context.QualityCertificates
                .AsEnumerable()
                .Where(q => !string.IsNullOrEmpty(q.NumeroCertificado) && q.NumeroCertificado.EndsWith("-" + anoAtual))
                .OrderByDescending(q => q.NumeroCertificado)
                .FirstOrDefault();

            if (ultimoCert != null)
            {
                var partes = ultimoCert.NumeroCertificado.Split('-');
                if (partes.Length == 2 && int.TryParse(partes[0], out int numeroAnterior))
                {
                    proximoNumero = numeroAnterior + 1;
                }
            }

            string novoNumero = proximoNumero.ToString("D3") + "-" + anoAtual;
            cert.NumeroCertificado = novoNumero;
            cert.Data = now.ToString("yyyy-MM-dd HH:mm:ss");
            cert.CreateDate = now;

            _context.QualityCertificates.Add(cert);
            _context.SaveChanges();

            return cert;
        }





        public string GetLastCertNumber()
        {
            string anoAtual = DateTime.Now.ToString("yy"); // ex: "25"

            // Trazer para memória os certificados que terminam com "-AA"
            var certificadosAnoAtual = _context.QualityCertificates
                .Where(q => !string.IsNullOrEmpty(q.NumeroCertificado) && q.NumeroCertificado.EndsWith("-" + anoAtual))
                .AsEnumerable();  // força trazer para memória para LINQ to Objects

            // Extrair o número antes do hífen e converter para int
            var numeros = certificadosAnoAtual
                .Select(q => {
                    var partes = q.NumeroCertificado.Split('-');
                    return int.TryParse(partes[0], out int n) ? n : 0;
                });

            int ultimoNumero = numeros.Any() ? numeros.Max() : 0;
            int proximoNumero = ultimoNumero + 1;

            string numeroFormatado = $"{proximoNumero:D3}-{anoAtual}";
            return numeroFormatado;
        }
    }
}