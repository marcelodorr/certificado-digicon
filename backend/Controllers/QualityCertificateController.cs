using System.Globalization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public record DefinirCaminhoRequest(string? Path);
    public record GerarPdfRequest(string? Numero);

    public class QualityCertificateCreateDto
    {
        public int? ControleElebId { get; set; }
        public string? NumeroCertificado { get; set; }
        public string? Ordem { get; set; }
        public string? OC { get; set; }
        public string? Lote { get; set; }
        public string? CodigoCliente { get; set; }
        public string? PartNumber { get; set; }
        public string? ValorPeca { get; set; }
        public string? AnalisePo { get; set; }
        public string? RevisaoDesenho { get; set; }
        public string? Quantidade { get; set; }
        public string? Decapagem { get; set; }
        public string? SNDecapagem { get; set; }
        public string? CDChamado { get; set; }
        public string? Cliente { get; set; }
        public string? Fornecedor { get; set; }
        public string? RelatorioInspecao { get; set; }
        public string? CertificadoMP { get; set; }
        public string? Responsavel { get; set; }
        public string? DesenhoLP { get; set; }
        public string? Observacoes { get; set; }
        public string? SNPeca { get; set; }
        public string? TipoEnvio { get; set; }
        public string? DescricaoOperacao { get; set; }
        public string? Data { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class QualityCertificateController : ControllerBase
    {
        private readonly QualityCertificateService _service;

        public QualityCertificateController(QualityCertificateService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Ping() => Ok(new { ok = true, controller = "QualityCertificate" });

        // GET /api/QualityCertificate/novo-certificado
        [HttpGet("novo-certificado")]
        public IActionResult GetNovoCertificado([FromQuery] string? data = null)
        {
            var year = DateTime.Now.Year;
            if (!string.IsNullOrWhiteSpace(data))
            {
                if (DateTime.TryParse(data, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var d) ||
                    DateTime.TryParse(data, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out d) ||
                    DateTime.TryParse(data, new CultureInfo("en-US"), DateTimeStyles.AssumeLocal, out d))
                {
                    year = d.Year;
                }
            }
            var numero = _service.GerarNumeroCertificado(year);
            return Ok(new { numero });
        }

        // GET /api/QualityCertificate/lista
        [HttpGet("lista")]
        public async Task<IActionResult> GetLista()
        {
            var numeros = await _service.ListarNumerosAsync();
            return Ok(numeros);
        }

        // POST /api/QualityCertificate
[HttpPost]
public async Task<IActionResult> CreateCertificate([FromBody] QualityCertificateCreateDto dto)
{
    if (dto is null)
        return BadRequest(new { message = "Payload não informado." });

    // 1) Parse de Data (aceita ISO/pt-BR/en-US), fallback Now
    var data = DateTime.Now;
    if (!string.IsNullOrWhiteSpace(dto.Data))
    {
        if (!DateTime.TryParse(dto.Data, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out data) &&
            !DateTime.TryParse(dto.Data, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out data) &&
            !DateTime.TryParse(dto.Data, new CultureInfo("en-US"), DateTimeStyles.AssumeLocal, out data))
        {
            data = DateTime.Now;
        }
    }

    static string Nz(string? s) => s?.Trim() ?? string.Empty;

    var model = new QualityCertificateModel
    {
        ControleElebId    = dto.ControleElebId,
        NumeroCertificado = string.IsNullOrWhiteSpace(dto.NumeroCertificado) ? null : dto.NumeroCertificado!.Trim(),
        Ordem             = Nz(dto.Ordem),
        OC                = Nz(dto.OC),
        Lote              = Nz(dto.Lote),
        CodigoCliente     = Nz(dto.CodigoCliente),
        PartNumber        = Nz(dto.PartNumber),
        ValorPeca         = Nz(dto.ValorPeca),
        AnalisePo         = Nz(dto.AnalisePo),
        RevisaoDesenho    = Nz(dto.RevisaoDesenho),
        Quantidade        = Nz(dto.Quantidade),
        Decapagem         = Nz(dto.Decapagem),
        SNDecapagem       = Nz(dto.SNDecapagem),
        CDChamado         = Nz(dto.CDChamado),
        Cliente           = Nz(dto.Cliente),
        Fornecedor        = Nz(dto.Fornecedor),
        RelatorioInspecao = Nz(dto.RelatorioInspecao),
        CertificadoMP     = Nz(dto.CertificadoMP),
        Responsavel       = Nz(dto.Responsavel),
        DesenhoLP         = Nz(dto.DesenhoLP),
        Observacoes       = Nz(dto.Observacoes),
        SNPeca            = Nz(dto.SNPeca),
        TipoEnvio         = Nz(dto.TipoEnvio),
        DescricaoOperacao = Nz(dto.DescricaoOperacao),
        Data              = data
    };

    try
    {
        var created = await _service.CreateCertificate(model);
        return Created($"/api/QualityCertificate/{created.NumeroCertificado}", created);
    }
    catch (Microsoft.EntityFrameworkCore.DbUpdateException dbex)
    {
        // extrai mensagens úteis da causa raiz
        var root = dbex.GetBaseException();
        return StatusCode(500, new
        {
            message = "Falha ao salvar alterações no banco.",
            db_error = root.Message
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = ex.Message });
    }
}


        // POST /api/QualityCertificate/caminho
        [HttpPost("caminho")]
        public IActionResult DefinirCaminho([FromBody] DefinirCaminhoRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Path))
                return BadRequest(new { message = "Caminho inválido." });

            try
            {
                _service.SetOutputPath(req.Path!);
                return Ok(new { success = true, path = _service.GetOutputPath() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // POST /api/QualityCertificate/gerar-pdf
        [HttpPost("gerar-pdf")]
        public async Task<IActionResult> GerarPdf([FromBody] GerarPdfRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Numero))
                return BadRequest(new { message = "Número do certificado é obrigatório." });

            try
            {
                var savedPath = await _service.GerarPdfAsync(req.Numero!);
                return Ok(new { success = true, path = savedPath });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Certificado não encontrado." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
