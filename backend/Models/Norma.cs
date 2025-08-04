namespace backend.Models
{
    public class Normas
    {
        public int Id { get; set; }
        public string PartNumber { get; set; }
        public string Norma { get; set; }
        public string Revision { get; set; }
        public DateTime CreateDate { get; set; }
        public string Createby { get; set; }
        public DateTime? LastUpdate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
