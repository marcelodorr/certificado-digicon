using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace backend.Models
{
    public class NormaModel
    {
        public int Id { get; set; }
        [Required]
        public string PartNumber { get; set; }
        [Required]
        public string TechnicalStandard { get; set; } // Norma
        public string Requirement { get; set; }
        public string Revision { get; set; }
        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdated { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
