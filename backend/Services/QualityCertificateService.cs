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

    // Buscar todos os certificados do ano atual, ignorando as horas
    var certificadosDoAno = _context.QualityCertificates
        .Where(c => c.Data.Year == currentYear)  // Filtro apenas pelo ano
        .OrderByDescending(c => c.NumeroCertificado)
        .ToList();

    int newNumber = 1; // Default para o primeiro número

    if (certificadosDoAno.Any())
    {
        // Extrair o número sequencial do último certificado (ex: "002-25")
        var lastCertificado = certificadosDoAno.FirstOrDefault();
        var lastNumberPart = lastCertificado.NumeroCertificado.Split('-')[0];

        // Verificar se a parte numérica está no formato correto
        if (int.TryParse(lastNumberPart, out int lastNumber))
        {
            newNumber = lastNumber + 1;
        }
        else
        {
            // Caso a conversão falhe, vamos registrar um erro e continuar com o número 1
            newNumber = 1;
        }
    }

    // Gerar o número do certificado no formato "000-YY" (ex: 003-25)
    var formattedNumber = newNumber.ToString("D3"); // Formata com 3 dígitos
    return $"{formattedNumber}-{currentYear.ToString().Substring(2)}";  // Formato "003-25"
}



            // Criar um novo certificado
        // No método CreateCertificate, garanta que a data seja válida antes de salvar no banco
        public async Task<QualityCertificateModel> CreateCertificate(QualityCertificateModel model)
{
    DateTime validDate;

    // Verifica se a data fornecida é válida
    if (!DateTime.TryParse(model.Data.ToString(), out validDate))
    {
        validDate = DateTime.Now;  // Se a data for inválida, usamos a data atual
    }

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
        Data = validDate  // Usa a data válida
    };

    _context.QualityCertificates.Add(certificate);
    await _context.SaveChangesAsync();

    return model;
}





}
