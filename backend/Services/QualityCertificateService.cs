using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.EntityFrameworkCore;

public class QualityCertificateService
{
    private readonly AppDbContext _context;
    private static string _outputPath = ""; // configurável via endpoint

    public QualityCertificateService(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // Helpers de numeração/ano
    // =========================
    private static int SafeYear(DateTime? dt) => (dt ?? DateTime.Now).Year;

    private static string BuildNumero(int sequence, int year)
    {
        // 000-YY
        int yy = year % 100;
        return $"{sequence:D3}-{yy:D2}";
    }

    private static int ParseSequence(string? numero)
    {
        // espera "000-YY"
        if (string.IsNullOrWhiteSpace(numero)) return 0;
        var dash = numero.IndexOf('-');
        if (dash <= 0) return 0;
        var left = numero.Substring(0, dash);
        return int.TryParse(left, out var seq) ? seq : 0;
    }

    // Obtém o próximo sequencial para o ano, considerando Data.Year
    private async Task<int> GetNextSequenceForYearAsync(int year)
    {
        // carrega em memória para calcular o maior sequence parseando "NumeroCertificado"
        var certificadosDoAno = await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
            .Select(c => c.NumeroCertificado)
            .ToListAsync();

        var maxSeq = certificadosDoAno
            .Select(ParseSequence)
            .DefaultIfEmpty(0)
            .Max();

        return maxSeq + 1;
    }

    // ===== Caminho de saída =====
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

        var docs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
        var def = Path.Combine(docs, "Certificados");
        if (!Directory.Exists(def)) Directory.CreateDirectory(def);
        _outputPath = def;
        return _outputPath;
    }

    // ===== Lista de números salvos =====
    public async Task<List<string>> ListarNumerosAsync()
    {
        return await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => !string.IsNullOrEmpty(c.NumeroCertificado))
            .Select(c => c.NumeroCertificado)
            .Distinct()
            .OrderByDescending(n => n)
            .ToListAsync();
    }

    // ===== Sequencial por ano (opcional: gera para o ano atual) =====
    public string GerarNumeroCertificado(int? ano = null)
    {
        int year = ano ?? DateTime.Now.Year;

        // Como é usado em endpoint GET, manter síncrono aqui.
        // Para evitar acesso concorrente, apenas consulta; o incremento real
        // fica na criação/salvamento que é transacional.
        var certificadosDoAno = _context.QualityCertificates
            .AsNoTracking()
            .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
            .Select(c => c.NumeroCertificado)
            .ToList();

        var maxSeq = certificadosDoAno
            .Select(ParseSequence)
            .DefaultIfEmpty(0)
            .Max();

        var nextSeq = maxSeq + 1;
        return BuildNumero(nextSeq, year);
    }

    // ===== Criar certificado (gera número se não vier) =====
    public async Task<QualityCertificateModel> CreateCertificate(QualityCertificateModel model)
{
    // 0) Helpers locais
    static string Trunc(string? s, int max) => string.IsNullOrEmpty(s) ? string.Empty : (s.Length <= max ? s : s.Substring(0, max));
    static int SafeYear(DateTime? dt) => (dt ?? DateTime.Now).Year;
    static string BuildNumero(int seq, int year) => $"{seq:D3}-{(year % 100):D2}";
    static int ParseSeq(string? numero)
    {
        if (string.IsNullOrWhiteSpace(numero)) return 0;
        var i = numero.IndexOf('-');
        if (i <= 0) return 0;
        return int.TryParse(numero.Substring(0, i), out var n) ? n : 0;
    }

    // 1) Data e ano
    var dataValidada = model.Data ?? DateTime.Now;
    int year = SafeYear(dataValidada);

    // 2) Normaliza strings e (opcional) trunca para evitar "String or binary data would be truncated"
    // Ajuste os limites conforme seu schema real (255 é seguro como guarda-chuva)
    model.Ordem             = Trunc(model.Ordem, 255);
    model.OC                = Trunc(model.OC, 255);
    model.Lote              = Trunc(model.Lote, 255);
    model.CodigoCliente     = Trunc(model.CodigoCliente, 255);
    model.PartNumber        = Trunc(model.PartNumber, 255);
    model.ValorPeca         = Trunc(model.ValorPeca, 255);
    model.AnalisePo         = Trunc(model.AnalisePo, 255);
    model.RevisaoDesenho    = Trunc(model.RevisaoDesenho, 255);
    model.Quantidade        = Trunc(model.Quantidade, 255);
    model.Decapagem         = Trunc(model.Decapagem, 255);
    model.SNDecapagem       = Trunc(model.SNDecapagem, 255);
    model.CDChamado         = Trunc(model.CDChamado, 255);
    model.Cliente           = Trunc(model.Cliente, 255);
    model.Fornecedor        = Trunc(model.Fornecedor, 255);
    model.RelatorioInspecao = Trunc(model.RelatorioInspecao, 255);
    model.CertificadoMP     = Trunc(model.CertificadoMP, 255);
    model.Responsavel       = Trunc(model.Responsavel, 255);
    model.DesenhoLP         = Trunc(model.DesenhoLP, 255);
    model.Observacoes       = Trunc(model.Observacoes, 4000); // geralmente maior
    model.SNPeca            = Trunc(model.SNPeca, 255);
    model.TipoEnvio         = Trunc(model.TipoEnvio, 255);
    model.DescricaoOperacao = Trunc(model.DescricaoOperacao, 4000);

    // 3) (Re)gerar número consistente com o ano e garantir UNICIDADE em transação
    await using var tx = await _context.Database.BeginTransactionAsync();

    // pega maior sequência do ano
    var existentesNoAno = await _context.QualityCertificates
        .AsNoTracking()
        .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
        .Select(c => c.NumeroCertificado)
        .ToListAsync();

    int maxSeq = existentesNoAno.Select(ParseSeq).DefaultIfEmpty(0).Max();
    int seq;

    if (string.IsNullOrWhiteSpace(model.NumeroCertificado))
    {
        seq = maxSeq + 1;
        model.NumeroCertificado = BuildNumero(seq, year);
    }
    else
    {
        // se vier número, valida sufixo de ano; se não bater, recalcula
        var expectedSuffix = (year % 100).ToString("D2", CultureInfo.InvariantCulture);
        var okSuffix = model.NumeroCertificado.Contains("-") &&
                       model.NumeroCertificado.Split('-').Last().Equals(expectedSuffix, StringComparison.Ordinal);

        if (!okSuffix)
        {
            seq = maxSeq + 1;
            model.NumeroCertificado = BuildNumero(seq, year);
        }
        else
        {
            // mantém seq informado, mas se já existir igual, incrementa até ficar único
            seq = ParseSeq(model.NumeroCertificado);
            if (existentesNoAno.Contains(model.NumeroCertificado))
            {
                do
                {
                    seq++;
                    model.NumeroCertificado = BuildNumero(seq, year);
                } while (existentesNoAno.Contains(model.NumeroCertificado));
            }
        }
    }

    // 4) Garante Data
    model.CreateDate = dataValidada;

    // 5) Persiste
    _context.QualityCertificates.Add(model);

    try
    {
        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return model;
    }
    catch
    {
        await tx.RollbackAsync();
        throw; // será capturado no Controller e retornará com inner exception
    }
}


    // ===== GERAR PDF (layout do anexo) =====
    public async Task<string> GerarPdfAsync(string numeroCertificado)
    {
        var cert = await _context.QualityCertificates
    .AsNoTracking()
    .Where(c => c.NumeroCertificado == numeroCertificado)
    .Select(c => new
    {
        c.NumeroCertificado,
        c.PartNumber,
        c.Cliente,
        c.OC,
        c.Lote,
        c.Ordem,
        c.CodigoCliente,
        c.SNPeca,
        c.DesenhoLP,
        c.RevisaoDesenho,
        c.Quantidade,
        c.DescricaoOperacao,
        c.Observacoes,
        c.TipoEnvio,
        c.Fornecedor,
        c.CertificadoMP,
        c.RelatorioInspecao,
        c.Responsavel,
        c.CreateDate // ← usamos esta data
    })
    .FirstOrDefaultAsync();
        if (cert == null) throw new KeyNotFoundException("Certificado não encontrado.");

        var basePath = GetOutputPath();
        var safeName = SanitizeFileName($"Certificado_de_Qualidade_{cert.NumeroCertificado}_{cert.PartNumber}.pdf");
        var fullPath = Path.Combine(basePath, safeName);

        var culture = new CultureInfo("pt-BR");
        var dt = cert.CreateDate == default ? DateTime.Now : cert.CreateDate;
        var dataStr = dt.ToString("dd/MM/yyyy", culture);

        // Fontes
        string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
        if (!File.Exists(fontPath)) fontPath = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
        BaseFont bf = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

        var fTitle  = new iTextSharp.text.Font(bf, 14, iTextSharp.text.Font.BOLD);
        var fH1     = new iTextSharp.text.Font(bf, 9, iTextSharp.text.Font.BOLD);
        var fH2     = new iTextSharp.text.Font(bf, 9, iTextSharp.text.Font.NORMAL);
        var fLabel  = new iTextSharp.text.Font(bf, 8,  iTextSharp.text.Font.BOLD);
        var fLabel2 = new iTextSharp.text.Font(bf, 8,  iTextSharp.text.Font.NORMAL);
        var fText   = new iTextSharp.text.Font(bf, 8,  iTextSharp.text.Font.NORMAL);
        var fSmall  = new iTextSharp.text.Font(bf, 7,  iTextSharp.text.Font.NORMAL);
        var fEmpresa= new iTextSharp.text.Font(bf, 7,  iTextSharp.text.Font.NORMAL);

        // helpers
        Paragraph KV(string label, string value, float spacingAfter = 2f, float indent = 0f)
        {
            var p = new Paragraph { SpacingAfter = spacingAfter, IndentationLeft = indent };
            p.Add(new Chunk(label + " ", fLabel));
            p.Add(new Chunk(string.IsNullOrWhiteSpace(value) ? "N/A" : value, fText));
            return p;
        }
        Paragraph SectionTitle(string text, float spacingBefore = 8f, float spacingAfter = 6f)
            => new Paragraph(text, fH1) { SpacingBefore = spacingBefore, SpacingAfter = spacingAfter };

        PdfPCell Cell(string text, iTextSharp.text.Font font, int align = Element.ALIGN_LEFT, BaseColor bg = null, float pad = 6, int border = Rectangle.BOX)
        {
            var c = new PdfPCell(new Phrase(text ?? "", font))
            {
                HorizontalAlignment = align,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = pad,
                Border = border
            };
            if (bg != null) c.BackgroundColor = bg;
            return c;
        }

        using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
        using (var doc = new Document(PageSize.A4, 32, 32, 32, 32))
        using (PdfWriter.GetInstance(doc, fs))
        {
            doc.Open();

            // ===== Cabeçalho =====
            iTextSharp.text.Image logoImg = null;
            try
            {
                var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "logo-digicon.png");
                if (File.Exists(logoPath))
                {
                    logoImg = iTextSharp.text.Image.GetInstance(logoPath);
                    logoImg.ScaleToFit(100f, 32f);
                    logoImg.Alignment = iTextSharp.text.Image.ALIGN_LEFT;
                }
            }
            catch { /* ignore */ }

            var head = new PdfPTable(2) { WidthPercentage = 100 };
            head.SetWidths(new float[] { 70, 30 });

            var leftCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 0f };
            if (logoImg != null) leftCell.AddElement(logoImg);
            head.AddCell(leftCell);

            var right = new PdfPTable(1) { WidthPercentage = 100 };
            right.AddCell(new PdfPCell(new Phrase($"Nº {cert.NumeroCertificado}", fLabel))
            { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 0f });
            right.AddCell(new PdfPCell(new Phrase(dataStr, fLabel2))
            { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT, PaddingTop = 0f, PaddingBottom = 6f });
            head.AddCell(new PdfPCell(right) { Border = Rectangle.NO_BORDER, Padding = 0f });
            doc.Add(head);

            // Título
            doc.Add(new Paragraph("CERTIFICADO DE CONFORMIDADE", fTitle)
            { Alignment = Element.ALIGN_CENTER, SpacingBefore = 4f, SpacingAfter = 8f });

            // Bloco da empresa (linhas simples)
            var empresaLines = new[]
            {
                "Razão Social: Digicon S/A",
                "Inscrição Estadual: 570028779",
                "CNPJ: 88.020.102/0001-10",
                "Endereço completo: Rua Nissin Castiel, Nº 640 - Gravataí/RS - Brasil"
            };
            foreach (var line in empresaLines)
                doc.Add(new Paragraph(line, fEmpresa) { SpacingAfter = 1f });

            // Frase centralizada em negrito com o cliente
            doc.Add(new Paragraph($"Emitido pelo nosso Controle de Qualidade, que se destina à {cert.Cliente}", fH1)
            { Alignment = Element.ALIGN_CENTER, SpacingBefore = 8f, SpacingAfter = 12f });

            // ===== 1. DADOS DE ORIGEM (sem tabela)
            doc.Add(SectionTitle("1. DADOS DE ORIGEM"));
            doc.Add(KV("1.1 OC CLIENTE n°:", cert.OC ?? ""));
            doc.Add(KV("1.2 LOTE CLIENTE n°:", cert.Lote ?? ""));
            doc.Add(KV("1.3 ORDEM n°:", cert.Ordem ?? "", spacingAfter: 8f));

            // ===== 2. DADOS DESSA REMESSA (sem tabela)
            doc.Add(SectionTitle("2. DADOS DESSA REMESSA"));
            doc.Add(KV("2.1 CÓDIGO CLIENTE n°:", cert.CodigoCliente ?? "", spacingAfter: 4f));

            doc.Add(KV("2.2 PN n°:", cert.PartNumber ?? ""));
            doc.Add(KV("      SN:", cert.SNPeca ?? "", spacingAfter: 4f));

            // 2.3 Revisões
            doc.Add(new Paragraph("2.3 REVISÃO:", fLabel));
            doc.Add(KV("      DESENHO (LP) - Revisão:", cert.DesenhoLP ?? ""));
            var pl = new Paragraph { SpacingAfter = 2f };
            pl.Add(new Chunk("      DESENHO (2D / MBD) - Folha: ", fLabel));
            pl.Add(new Chunk(cert.RevisaoDesenho ?? "—", fText));
            pl.Add(new Chunk("      Revisão: ", fLabel));
            pl.Add(new Chunk(cert.RevisaoDesenho ?? "—", fText));
            doc.Add(pl);

            doc.Add(KV("2.4 QUANTIDADE:", cert.Quantidade ?? ""));
            doc.Add(KV("2.5 OPERAÇÕES EXECUTADAS:", cert.DescricaoOperacao ?? ""));

            // ===== 3. OBSERVAÇÕES
            doc.Add(SectionTitle("3. OBSERVAÇÕES"));
            doc.Add(new Paragraph(cert.Observacoes ?? "", fText));

            var envio = new Paragraph { SpacingAfter = 2f };
            envio.Add(new Chunk("TIPO DE ENVIO: ", fLabel));
            envio.Add(new Chunk(cert.TipoEnvio ?? "—", fText));
            doc.Add(envio);

            string fornecedor = string.IsNullOrWhiteSpace(cert.Fornecedor) ? "N/A" : cert.Fornecedor!;
            string certMP    = string.IsNullOrWhiteSpace(cert.CertificadoMP) ? "N/A" : cert.CertificadoMP!;
            string relInsp   = string.IsNullOrWhiteSpace(cert.RelatorioInspecao) ? cert.NumeroCertificado ?? "—" : cert.RelatorioInspecao!;

            doc.Add(new Paragraph(
                $"Certificamos que a Matéria-Prima foi recebida do fornecedor {fornecedor}, estando a mesma aprovada conforme Certificado de Conformidade nº: {cert.NumeroCertificado}.",
                fSmall) { SpacingAfter = 2f, SpacingBefore = 12f });

            doc.Add(new Paragraph(
                $"Certificamos que o PN {cert.PartNumber ?? "N/A"} acima mencionado foi inspecionado e aprovado pelo nosso Controle de Qualidade, estando conforme desenho e revisões mencionados.",
                fSmall) { SpacingAfter = 2f });

            doc.Add(new Paragraph(
                $"Os requisitos de projeto executados em nossa empresa e por nossos fornecedores foram aprovados em todas as características conforme evidências reportadas no relatório de inspeção nº {relInsp} e dados abaixo:",
                fSmall) { SpacingAfter = 6f });

            // ===== Tabela final
            doc.Add(new Paragraph(" ", fText) { SpacingAfter = 6f });

            PdfPCell H(string txt, int colspan = 1, int rowspan = 1)
            {
                return new PdfPCell(new Phrase(txt, fLabel))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    BackgroundColor = new BaseColor(230, 230, 230),
                    PaddingTop = 4f,
                    PaddingBottom = 4f,
                    Colspan = colspan,
                    Rowspan = rowspan
                };
            }
            PdfPCell D(string txt, int align = Element.ALIGN_LEFT)
            {
                return new PdfPCell(new Phrase(string.IsNullOrWhiteSpace(txt) ? "---" : txt, fText))
                {
                    HorizontalAlignment = align,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingTop = 4f,
                    PaddingBottom = 4f
                };
            }

            var table = new PdfPTable(5) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 14, 10, 36, 20, 20 });

            // Cabeçalho (linha 1)
            table.AddCell(H("ESPECIFICAÇÃO EDE", colspan: 2)); // NE/NI + REVISÃO
            table.AddCell(H("DESCRIÇÃO DO REQUISITO"));
            table.AddCell(H("FORNECEDOR"));
            table.AddCell(H("CERTIFICADO DE CONFORMIDADE"));
            // Cabeçalho (linha 2)
            table.AddCell(H("NE/NI"));
            table.AddCell(H("REVISÃO"));
            table.AddCell(H("---"));
            table.AddCell(H("---"));
            table.AddCell(H("---"));

            // ===== Dados (Normas) =====
            List<(string Especificacao, string Revisao, string Descricao)> normasRows;
            try
            {
                var normas = await _context.TechnicalStandards
                    .AsNoTracking()
                    .Where(n => n.PartNumber == cert.PartNumber)
                    .Select(n => new { n.TechnicalStandard, n.Revision, n.Requirement })
                    .ToListAsync();

                normasRows = normas.Select(n => (
                    Especificacao: n.TechnicalStandard ?? "—",
                    Revisao:       n.Revision ?? "—",
                    Descricao:     n.Requirement ?? "---"
                )).ToList();
            }
            catch
            {
                normasRows = new List<(string, string, string)>();
            }

            if (normasRows.Count == 0)
            {
                table.AddCell(D("—"));
                table.AddCell(D("—", Element.ALIGN_CENTER));
                table.AddCell(D("---"));
                table.AddCell(D("---", Element.ALIGN_CENTER));
                table.AddCell(D("---", Element.ALIGN_CENTER));
            }
            else
            {
                bool firstRow = true;
                foreach (var r in normasRows)
                {
                    table.AddCell(D(r.Especificacao));                 // NE/NI
                    table.AddCell(D(r.Revisao, Element.ALIGN_CENTER)); // REVISÃO
                    table.AddCell(D(r.Descricao));                     // DESCRIÇÃO

                    if (firstRow)
                    {
                        var fornCell = D(fornecedor, Element.ALIGN_CENTER);
                        fornCell.Rowspan = normasRows.Count;
                        table.AddCell(fornCell);

                        var certCell = D(cert.NumeroCertificado ?? "---", Element.ALIGN_CENTER);
                        certCell.Rowspan = normasRows.Count;
                        table.AddCell(certCell);

                        firstRow = false;
                    }
                }
            }

            doc.Add(table);

            // Frase de arquivo por 7 anos
            doc.Add(new Paragraph(
                "Toda a documentação permanecerá arquivada nesta Empresa pelo prazo mínimo de 07 (sete) anos à disposição do Contratante.",
                fText) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 12f, SpacingBefore = 12f });

            // ===== Assinatura (imagem opcional centralizada) =====
            iTextSharp.text.Image assinaturaImg = null;
            try
            {
                var assinaturaPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "assinatura-muller.png");
                if (File.Exists(assinaturaPath))
                {
                    assinaturaImg = iTextSharp.text.Image.GetInstance(assinaturaPath);
                    assinaturaImg.ScaleToFit(110f, 36f);
                    assinaturaImg.Alignment = iTextSharp.text.Image.ALIGN_CENTER;
                }
            }
            catch { /* ignore */ }

            if (assinaturaImg != null)
            {
                doc.Add(assinaturaImg);
            }
            else
            {
                var p = new Paragraph("______________________________", fText)
                { Alignment = Element.ALIGN_CENTER, SpacingBefore = 1f };
                doc.Add(p);
            }
            doc.Add(new Paragraph(cert.Responsavel ?? "Responsável", fText)
            { Alignment = Element.ALIGN_CENTER, SpacingAfter = 2f, SpacingBefore = 1f });

            doc.Add(new Paragraph("Responsável", fSmall)
            { Alignment = Element.ALIGN_CENTER, SpacingAfter = 0f });

            doc.Close();
        }

        return fullPath;
    }

    // ===== Util =====
    private static string SanitizeFileName(string name)
    {
        foreach (var ch in Path.GetInvalidFileNameChars())
            name = name.Replace(ch, '_');
        return name;
    }

    // (Opcional) Exemplo de busca de normas (ajuste DbSet/colunas)
    private async Task<List<(string especificacao, string descricao, string fornecedor, string certConformidade, string neNi, string revisao)>>
        GetLinhasNormasAsync(string partNumber)
    {
        var normas = await _context.TechnicalStandards
            .AsNoTracking()
            .Where(n => n.PartNumber == partNumber)
            .ToListAsync();

        return normas.Select(n => (
            especificacao: n.TechnicalStandard ?? "—",
            descricao:     n.Requirement ?? "—",
            fornecedor:    "—",
            certConformidade: "—",
            neNi:          "—",
            revisao:       n.Revision ?? "—"
        )).ToList();
    }
}
