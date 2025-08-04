namespace backend.Models
{
    public class QualityCertificate
    {
        public int Id { get; set; }
        public string Fornecedor { get; set; }
        public string NumeroInspecao { get; set; }
        public string CertificadoConformidade { get; set; }
        public string Responsavel { get; set; }
        public string DesenhoRevisao { get; set; }
        public string Observacoes { get; set; }
        public string SnPeca { get; set; }
        public string PartNumber { get; set; }
        public string Norma { get; set; }
        public string Revisao { get; set; }
        public string NumeroCertificado { get; set; }
        public DateTime DataCadastro { get; set; }
    }
}
