using Autofac;
using Business.Abstract;
using Business.Concrete;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;

namespace Business.DependencyResolvers.Autofac;

public class AutofacBusinessModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        // Repositories
        builder.RegisterType<EfRoomDal>().As<IRoomDal>().InstancePerLifetimeScope();
        builder.RegisterType<EfBossDal>().As<IBossDal>().InstancePerLifetimeScope();
        builder.RegisterType<EfPunchLogDal>().As<IPunchLogDal>().InstancePerLifetimeScope();
        builder.RegisterType<EfAdminUserDal>().As<IAdminUserDal>().InstancePerLifetimeScope();

        // Services
        builder.RegisterType<RoomManager>().As<IRoomService>().InstancePerLifetimeScope();
        builder.RegisterType<BossManager>().As<IBossService>().InstancePerLifetimeScope();
        builder.RegisterType<LinkedInScraperManager>().As<ILinkedInScraperService>().InstancePerLifetimeScope();
        builder.RegisterType<AdminManager>().As<IAdminService>().InstancePerLifetimeScope();
    }
}
