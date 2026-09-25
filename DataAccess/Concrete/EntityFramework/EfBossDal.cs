using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework.Contexts;
using Entities.Concrete;

namespace DataAccess.Concrete.EntityFramework;

public class EfBossDal : EfEntityRepositoryBase<Boss, BossBattleDbContext>, IBossDal
{
    public EfBossDal(BossBattleDbContext context) : base(context)
    {
    }
}
