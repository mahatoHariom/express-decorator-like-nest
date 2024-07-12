import { ClassType } from "../../decorators/module";
import { INJECTABLE_METADATA_KEY } from "../../domain/@types/constants";
export class DIContainer {
  private providers = new Map<ClassType, any>();
  private globalProviders = new Map<ClassType, any>();

  register<T>(
    token: ClassType<T>,
    options: { useClass: ClassType<T>; global?: boolean }
  ) {
    if (options.global) {
      this.globalProviders.set(token, new options.useClass());
    } else {
      this.providers.set(token, { useClass: options.useClass, instance: null });
    }
  }

  get<T>(token: ClassType<T>): T {
    if (this.globalProviders.has(token)) {
      return this.globalProviders.get(token);
    }
    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(`No provider found for ${token.name}`);
    }
    if (!provider.instance) {
      provider.instance = new provider.useClass();
    }
    return provider.instance;
  }

  isGlobal<T>(token: ClassType<T>): boolean {
    return this.globalProviders.has(token);
  }

  getGlobalProvider<T>(token: ClassType<T>): T {
    if (this.globalProviders.has(token)) {
      return this.globalProviders.get(token);
    }
    throw new Error(`No global provider found for ${token.name}`);
  }
}

export const diContainer = new DIContainer();

// class DIContainer {
//   private services: Map<ClassType, any> = new Map();

//   register<T>(cls: ClassType<T>, options?: { useClass: ClassType }): void {
//     const { useClass } = options || { useClass: cls };
//     if (!Reflect.getMetadata(INJECTABLE_METADATA_KEY, useClass)) {
//       throw new Error(`${useClass.name} is not marked as @Injectable`);
//     }
//     this.services.set(cls, useClass);
//   }

//   get<T>(cls: ClassType<T>): T {
//     const service = this.services.get(cls);
//     if (!service) {
//       throw new Error(`${cls.name} is not registered`);
//     }
//     const dependencies =
//       Reflect.getMetadata("design:paramtypes", service) || [];
//     const params = dependencies.map((dep: ClassType) => this.get(dep));
//     return new service(...params);
//   }
// }

// export const diContainer = new DIContainer();
