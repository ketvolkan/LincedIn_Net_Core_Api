using System.Linq.Expressions;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.DataAccess.EntityFramework;

public class EfEntityRepositoryBase<TEntity, TContext> : IEntityRepository<TEntity>
    where TEntity : class, IEntity, new()
    where TContext : DbContext
{
    protected readonly TContext Context;

    public EfEntityRepositoryBase(TContext context)
    {
        Context = context;
    }

    public async Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>>? filter = null)
    {
        return filter == null
            ? await Context.Set<TEntity>().ToListAsync()
            : await Context.Set<TEntity>().Where(filter).ToListAsync();
    }

    public async Task<TEntity?> GetAsync(Expression<Func<TEntity, bool>> filter)
    {
        return await Context.Set<TEntity>().SingleOrDefaultAsync(filter);
    }

    public async Task AddAsync(TEntity entity)
    {
        var addedEntity = Context.Entry(entity);
        addedEntity.State = EntityState.Added;
        await Context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TEntity entity)
    {
        var updatedEntity = Context.Entry(entity);
        updatedEntity.State = EntityState.Modified;
        await Context.SaveChangesAsync();
    }

    public async Task DeleteAsync(TEntity entity)
    {
        var deletedEntity = Context.Entry(entity);
        deletedEntity.State = EntityState.Deleted;
        await Context.SaveChangesAsync();
    }
}
