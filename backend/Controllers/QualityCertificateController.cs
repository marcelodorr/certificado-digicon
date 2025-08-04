using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QualityCertificateController : ControllerBase
    {
        private readonly QualityCertificateService _service;

        public QualityCertificateController(QualityCertificateService service)
        {
            _service = service;
        }

        [HttpPost("add")]
        public IActionResult AddCertificate([FromBody] QualityCertificate cert)
        {
            var result = _service.Add(cert);
            return Ok(result);
        }

        [HttpGet("last-cert-number")]
        public IActionResult GetLastCertNumber()
        {
            var last = _service.GetLastCertNumber();
            return Ok(last);
        }
    }
}