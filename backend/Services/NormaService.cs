using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class NormaService
    {
        private readonly AppDbContext _context;

        public NormaService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todas as normas não deletadas
        public async Task<List<NormaModel>> GetNormasAsync()
        {
            return await _context.TechnicalStandards
                .Where(n => !n.IsDeleted)
                .Select(n => new NormaModel
                {
                    Id = n.Id,
                    PartNumber = n.PartNumber,
                    TechnicalStandard = n.TechnicalStandard,
                    Requirement = n.Requirement,
                    Revision = n.Revision,
                    CreateBy = n.CreateBy,
                    CreateDate = n.CreateDate,
                    LastUpdated = n.LastUpdated,
                    IsDeleted = n.IsDeleted
                })
                .ToListAsync();
        }

        // Criar uma nova norma
        public async Task<NormaModel> CreateNormaAsync(NormaModel norma)
        {
            var newNorma = new NormaModel
            {
                PartNumber = norma.PartNumber,
                TechnicalStandard = norma.TechnicalStandard,
                Requirement = norma.Requirement,
                Revision = norma.Revision,
                CreateBy = norma.CreateBy,
                CreateDate = norma.CreateDate,
                IsDeleted = false
            };

            _context.TechnicalStandards.Add(newNorma);
            await _context.SaveChangesAsync();

            norma.Id = newNorma.Id;
            return norma;
        }

        // Atualizar uma norma existente
        public async Task<NormaModel> UpdateNormaAsync(NormaModel norma)
        {
            var existingNorma = await _context.TechnicalStandards.FindAsync(norma.Id);

            if (existingNorma == null)
            {
                return null;
            }

            existingNorma.PartNumber = norma.PartNumber;
            existingNorma.TechnicalStandard = norma.TechnicalStandard;
            existingNorma.Requirement = norma.Requirement;
            existingNorma.Revision = norma.Revision;
            existingNorma.LastUpdated = DateTime.Now;

            _context.TechnicalStandards.Update(existingNorma);
            await _context.SaveChangesAsync();

            return norma;
        }

        // Excluir uma norma (marcando como deletada)
        public async Task<bool> DeleteNormaAsync(int id)
        {
            var norma = await _context.TechnicalStandards.FindAsync(id);

            if (norma == null)
            {
                return false;
            }

            norma.IsDeleted = true;
            _context.TechnicalStandards.Update(norma);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
