using Microsoft.AspNetCore.Mvc;

public record DefinirCaminhoRequest(string Path);
public record GerarPdfRequest(string Numero);
[Route("api/[controller]")]
[ApiController]
public class QualityCertificateController : ControllerBase
{
    private readonly QualityCertificateService _service;

    public QualityCertificateController(QualityCertificateService service)
    {
        _service = service;
    }

    // Obter o novo número de certificado
    [HttpGet("novo-certificado")]
    public IActionResult GetNovoCertificado()
    {
        var numero = _service.GerarNumeroCertificado();
        return Ok(new { numero });
    }

    // Criar um novo certificado
    [HttpPost]
    public async Task<IActionResult> CreateCertificate([FromBody] QualityCertificateModel model)
    {
        if (model == null) return BadRequest("Dados inválidos.");

        // Verificar se a data está correta
        if (!DateTime.TryParse(model.Data.ToString(), out DateTime validDate))
        {
            validDate = DateTime.Now;  // Caso a data seja inválida, utiliza a data atual
        }

        model.Data = validDate;  // Atribui a data validada ao modelo

        // Gerar o número de certificado antes de salvar
        model.NumeroCertificado = _service.GerarNumeroCertificado();

        var createdCertificate = await _service.CreateCertificate(model);
        return Ok(createdCertificate);
    }

    // 👉 definir/alterar caminho padrão de salvamento dos PDFs
    [HttpPost("caminho")]
    public IActionResult DefinirCaminho([FromBody] DefinirCaminhoRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Path))
            return BadRequest("Caminho inválido.");

        try
        {
            _service.SetOutputPath(req.Path);
            return Ok(new { success = true, path = _service.GetOutputPath() });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // 👉 gerar o PDF do certificado
    [HttpPost("gerar-pdf")]
    public async Task<IActionResult> GerarPdf([FromBody] GerarPdfRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Numero))
            return BadRequest("Número do certificado é obrigatório.");

        try
        {
            var savedPath = await _service.GerarPdfAsync(req.Numero);
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

    [HttpGet("lista")]
    public async Task<IActionResult> GetLista()
    {
        var numeros = await _service.ListarNumerosAsync();
        return Ok(numeros); // retorna string[]
    }

}
