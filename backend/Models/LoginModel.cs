namespace backend.Models
{
    public class LoginModel
    {
        public int Id { get; set; }
        public string User { get; set; }
        public string Password { get; set; }  // Hashed
    }
}
