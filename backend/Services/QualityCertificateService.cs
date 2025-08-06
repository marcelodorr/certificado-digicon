using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;

public class QualityCertificateService
{
    private readonly AppDbContext _context;

    public QualityCertificateService(AppDbContext context)
    {
        _context = context;
    }

            // Gerar o próximo número de certificado sequencial por ano
            public string GerarNumeroCertificado()
        {
            var currentYear = DateTime.Now.Year;

            // Buscar todos os certificados do ano atual e ordenar pelo número do certificado
            var certificadosDoAno = _context.QualityCertificates
                .Where(c => c.Data.Year == currentYear)  // Comparação direta com a propriedade Data (tipo DateTime)
                .OrderByDescending(c => c.NumeroCertificado)
                .ToList();  // Executando a consulta no banco e trazendo os dados para a memória

            int newNumber = 1; // Default para o primeiro número

            if (certificadosDoAno.Any())
            {
                // Extrair o número sequencial do último certificado (ex: "002-25")
                var lastCertificado = certificadosDoAno.FirstOrDefault();
                var lastNumberPart = lastCertificado.NumeroCertificado.Split('-')[0];
                newNumber = int.Parse(lastNumberPart) + 1;
            }

            // Gerar o número do certificado no formato "000-YY" (ex: 003-25)
            var formattedNumber = newNumber.ToString("D3");
            return $"{formattedNumber}-{currentYear.ToString().Substring(2)}";
        }

            // Criar um novo certificado
        public async Task<QualityCertificateModel> CreateCertificate(QualityCertificateModel model)
        {
            var certificate = new QualityCertificateModel
            {
                NumeroCertificado = model.NumeroCertificado,
                Ordem = model.Ordem,
                OC = model.OC,
                Lote = model.Lote,
                CodigoCliente = model.CodigoCliente,
                PartNumber = model.PartNumber,
                ValorPeca = model.ValorPeca,
                AnalisePo = model.AnalisePo,
                RevisaoDesenho = model.RevisaoDesenho,
                Quantidade = model.Quantidade,
                Decapagem = model.Decapagem,
                SNDecapagem = model.SNDecapagem,
                CDChamado = model.CDChamado,
                Cliente = model.Cliente,
                Fornecedor = model.Fornecedor,
                RelatorioInspecao = model.RelatorioInspecao,
                CertificadoMP = model.CertificadoMP,
                Responsavel = model.Responsavel,
                DesenhoLP = model.DesenhoLP,
                Observacoes = model.Observacoes,
                SNPeca = model.SNPeca,
                TipoEnvio = model.TipoEnvio,
                DescricaoOperacao = model.DescricaoOperacao,
                Data = DateTime.Now // Salva como DateTime, sem formatação para string
            };

            _context.QualityCertificates.Add(certificate);
            await _context.SaveChangesAsync();

            return model;
        }

}
