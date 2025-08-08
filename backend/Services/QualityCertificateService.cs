using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.EntityFrameworkCore;
using System.Globalization;


public class QualityCertificateService
{
    private readonly AppDbContext _context;
    private static string _outputPath = ""; // configurável via endpoint

    public QualityCertificateService(AppDbContext context)
    {
        _context = context;
    }
    public void SetOutputPath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            throw new ArgumentException("Caminho inválido.");

        if (!Directory.Exists(path))
            Directory.CreateDirectory(path);

        _outputPath = path;
    }
    public string GetOutputPath()
    {
        if (!string.IsNullOrWhiteSpace(_outputPath))
            return _outputPath;

        // fallback padrão: Meus Documentos\Certificados
        var docs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
        var def = Path.Combine(docs, "Certificados");
        if (!Directory.Exists(def)) Directory.CreateDirectory(def);
        _outputPath = def;
        return _outputPath;
    }
    public async Task<List<string>> ListarNumerosAsync()
    {
        return await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => !string.IsNullOrEmpty(c.NumeroCertificado))
            .Select(c => c.NumeroCertificado)
            .Distinct()
            .OrderByDescending(n => n) // 003-25 > 002-25...
            .ToListAsync();
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

    // ====== GERAR PDF ======
    public async Task<string> GerarPdfAsync(string numeroCertificado)
    {
        // 1) buscar certificado
        var cert = await _context.QualityCertificates
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.NumeroCertificado == numeroCertificado);

        if (cert == null)
            throw new KeyNotFoundException("Certificado não encontrado.");

        // 2) preparar caminho/arquivo
        var basePath = GetOutputPath();
        var safeName = SanitizeFileName($"{cert.NumeroCertificado}.pdf");
        var fullPath = Path.Combine(basePath, safeName);

        // 3) criar documento
        var culture = new CultureInfo("pt-BR");
        var dataStr = cert.Data.ToString("dd/MM/yyyy", culture);

        // Fonte com acentuação (pega Arial do Windows; se estiver em Linux, troque por uma TTF existente)
        var fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
        BaseFont bf = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        var fTitle = new Font(bf, 16, Font.BOLD);
        var fHeader = new Font(bf, 12, Font.BOLD);
        var fText  = new Font(bf, 10, Font.NORMAL);

        using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
        using (var doc = new Document(PageSize.A4, 36, 36, 36, 36))
        using (var writer = PdfWriter.GetInstance(doc, fs))
        {
            doc.Open();

            // Cabeçalho
            var title = new Paragraph("CERTIFICADO DE QUALIDADE", fTitle) { Alignment = Element.ALIGN_CENTER };
            doc.Add(title);
            doc.Add(new Paragraph($"Nº {cert.NumeroCertificado}", fHeader) { Alignment = Element.ALIGN_CENTER });
            doc.Add(new Paragraph($"Data: {dataStr}", fText) { SpacingAfter = 12 });

            // Seções em tabela 2 colunas (rótulo/valor)
            PdfPTable t1 = new PdfPTable(2) { WidthPercentage = 100 };
            t1.SetWidths(new float[] { 28, 72 });

            void AddRow(string rotulo, string? valor)
            {
                t1.AddCell(Cell(rotulo, fHeader, bg: new BaseColor(245,245,245)));
                t1.AddCell(Cell(valor ?? "—", fText));
            }

            AddRow("Ordem (OP Eleb)", cert.Ordem);
            AddRow("OC/PO", cert.OC);
            AddRow("Cliente", cert.Cliente);
            AddRow("Código Cliente", cert.CodigoCliente);
            AddRow("Part Number", cert.PartNumber);
            AddRow("Lote", cert.Lote);
            AddRow("Quantidade", cert.Quantidade);
            AddRow("Valor Produto", cert.ValorPeca);
            AddRow("Análise PO", cert.AnalisePo);
            AddRow("Revisão do Desenho", cert.RevisaoDesenho);
            AddRow("Desenho (LP) - Revisão", cert.DesenhoLP);
            AddRow("Decapagem Realizada", cert.Decapagem);
            AddRow("SN Decapagem", cert.SNDecapagem);
            AddRow("SN Peça", cert.SNPeca);
            AddRow("Fornecedor", cert.Fornecedor);
            AddRow("Relatório de Inspeção nº", cert.RelatorioInspecao);
            AddRow("Certificado Conformidade MP", cert.CertificadoMP);
            AddRow("Responsável Qualidade", cert.Responsavel);
            AddRow("Tipo de Envio", cert.TipoEnvio);
            AddRow("CD/Chamado", cert.CDChamado);
            AddRow("Operações Executadas", cert.DescricaoOperacao);

            doc.Add(t1);

            // Observações (bloco separado)
            if (!string.IsNullOrWhiteSpace(cert.Observacoes))
            {
                doc.Add(Spacer(10));
                doc.Add(new Paragraph("Observações", fHeader));
                var obs = new Paragraph(cert.Observacoes, fText);
                obs.SpacingBefore = 5;
                doc.Add(obs);
            }

            // Assinatura
            doc.Add(Spacer(24));
            PdfPTable sign = new PdfPTable(2) { WidthPercentage = 100 };
            sign.SetWidths(new float[] { 50, 50 });
            sign.AddCell(LineForSignature("Responsável Qualidade", fText));
            sign.AddCell(LineForSignature("Representante do Cliente", fText));
            doc.Add(sign);

            doc.Close();
        }

        return fullPath;

        // helpers
        PdfPCell Cell(string text, Font font, BaseColor? bg = null)
        {
            var cell = new PdfPCell(new Phrase(text ?? "", font))
            {
                Padding = 6,
                HorizontalAlignment = Element.ALIGN_LEFT,
                VerticalAlignment = Element.ALIGN_MIDDLE
            };
            if (bg != null) cell.BackgroundColor = bg;
            return cell;
        }

        IElement Spacer(float h) => new Paragraph(" ") { SpacingAfter = h };

        PdfPCell LineForSignature(string caption, Font font)
        {
            var phrase = new Phrase($"{caption}\n\n______________________________", font);
            return new PdfPCell(phrase)
            {
                PaddingTop = 12,
                Border = Rectangle.NO_BORDER
            };
        }
    }

    private static string SanitizeFileName(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        foreach (var ch in invalid) name = name.Replace(ch, '_');
        return name;
    }
    
    
}
