using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços do Swagger (opcional para documentação da API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Adiciona os serviços do backend
builder.Services.AddScoped<QualityCertificateService>();
builder.Services.AddScoped<OperacaoService>();
builder.Services.AddScoped<NormasService>();
builder.Services.AddScoped<ClienteService>();

// Configuração do CORS - Permite requisições de qualquer origem
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()  // Permite qualquer origem (ou seja, do frontend rodando em outra porta, por exemplo, localhost:3000)
               .AllowAnyMethod()  // Permite qualquer método HTTP (GET, POST, etc.)
               .AllowAnyHeader());  // Permite qualquer cabeçalho
});

// Adiciona o DbContext para acesso ao banco de dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Adiciona controllers com suporte para JSON (Newtonsoft.Json)
builder.Services.AddControllers().AddNewtonsoftJson();

// Adiciona o suporte ao Swagger
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ativa o Swagger para documentação da API
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "certificado-digicon v1");
});

// Ativa o CORS para permitir que o frontend faça requisições
app.UseCors("AllowAll");

// Serve arquivos estáticos (se você estiver servindo o frontend React)
app.UseStaticFiles();  // Serve os arquivos estáticos da pasta wwwroot (geralmente criada ao rodar `npm run build` no frontend)

app.UseHttpsRedirection();  // Redireciona todas as requisições HTTP para HTTPS
app.UseAuthorization();  // Habilita a autorização de segurança

// Mapeia as rotas da API
app.MapControllers();

// Roteia todas as requisições que não corresponderem a uma API para o frontend React
app.MapFallbackToFile("index.html");  // Para suportar o React e SPA, redirecionando qualquer requisição não encontrada para o index.html do React

// Inicia o servidor
app.Run();
