using Microsoft.AspNetCore.Mvc;

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

        // Gerar o número de certificado antes de salvar
        model.NumeroCertificado = _service.GerarNumeroCertificado();

        var createdCertificate = await _service.CreateCertificate(model);
        return Ok(createdCertificate);
    }



    /*// Gerar o PDF do certificado
    [HttpGet("gerar-pdf/{numeroCertificado}")]
    public async Task<IActionResult> GerarPdf(string numeroCertificado)
    {
        var result = await _service.GerarPdf(numeroCertificado);
        return Ok(new { success = true, message = result });
    }
    */
}
