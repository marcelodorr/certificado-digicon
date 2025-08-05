using System.ComponentModel.DataAnnotations.Schema;

public class QualityCertificate
{
    public int Id { get; set; }
    public string NumeroCertificado { get; set; }
    public string Ordem { get; set; }
    public string OC { get; set; }
    public string Lote { get; set; }
    public string CodigoCliente { get; set; }
    public string PartNumber { get; set; }
    public string ValorPeca { get; set; }
    public string AnalisePo { get; set; }
    public string RevisaoDesenho { get; set; }
    public string Quantidade { get; set; }
    public string Decapagem { get; set; }
    public string SNDecapagem { get; set; }
    public string CDChamado { get; set; }
    public string Cliente { get; set; }
    public string Fornecedor { get; set; }
    public string RelatorioInspecao { get; set; }
    public string CertificadoMP { get; set; }
    public string Responsavel { get; set; }
    public string DesenhoLP { get; set; }
    public string Observacoes { get; set; }
    public string SNPeca { get; set; }
    public string TipoEnvio { get; set; }
    public string DescricaoOperacao { get; set; }
    public string Data { get; set; }
    public DateTime CreateDate { get; set; }

}
