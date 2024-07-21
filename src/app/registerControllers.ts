import express, { NextFunction, Request, Response } from "express";
import { Middleware, RouteMetadata } from "../domain/@types/common";
import { logger } from "../infrastructure/middlewares/morgan";
import {
  CONTROLLERS_KEY,
  ClassType,
  IMPORTS_KEY,
  PROVIDERS_KEY,
} from "../decorators/module";
import { asyncHandler } from "../infrastructure/middlewares/async-handler";
import {
  GLOBAL_PROVIDERS_KEY,
  INJECTABLE_METADATA_KEY,
} from "../domain/@types/constants";
import { diContainer } from "../infrastructure/config/diContainer";

export function instantiateProvider(
  Cls: ClassType,
  providerInstances: Map<ClassType, any>,
  providers: ClassType[]
): any {
  if (providerInstances.has(Cls)) return providerInstances.get(Cls);

  const isInjectable = Reflect.getMetadata(INJECTABLE_METADATA_KEY, Cls);
  if (!isInjectable) {
    throw new Error(`${Cls.name} is not marked as @Injectable.`);
  }

  const deps = Reflect.getMetadata("design:paramtypes", Cls) ?? [];
  const params = deps.map((dep: ClassType) => {
    if (diContainer.isGlobal(dep)) {
      const globalInstance = diContainer.getGlobalProvider(dep);
      providerInstances.set(dep, globalInstance);
      return globalInstance;
    }
    if (!providers.includes(dep) && !diContainer.isGlobal(dep)) {
      throw new Error(
        `Dependency ${dep.name} for ${Cls.name} is not listed as a provider or global provider.`
      );
    }
    return instantiateProvider(dep, providerInstances, providers);
  });

  const instance = new Cls(...params);
  providerInstances.set(Cls, instance);
  return instance;
}

export function registerControllers(
  app: express.Application,
  controllers: ClassType[],
  providerInstances: Map<ClassType, any>,
  providers: ClassType[]
) {
  controllers.forEach((ControllerCls) => {
    const isController = Reflect.hasMetadata("path", ControllerCls);

    // Check if the controller is registered but not marked with @Controller
    if (controllers.includes(ControllerCls) && !isController) {
      throw new Error(
        `${ControllerCls.name} is registered as a controller but not marked as @Controller.`
      );
    }

    const controllerInstance = instantiateProvider(
      ControllerCls,
      providerInstances,
      providers
    );

    const basePath = Reflect.getMetadata("path", ControllerCls) || "";
    const routes = Reflect.getMetadata(
      "routes",
      ControllerCls
    ) as RouteMetadata[];

    routes.forEach((route) => {
      const { method, path, handler, middlewares = [] } = route;
      const fullPath = `${basePath}${path}`;

      logger.info(`Registering route: ${method.toUpperCase()} ${fullPath}`);

      app[method](
        fullPath,
        ...middlewares,
        asyncHandler(
          async (req: Request, res: Response, next: NextFunction) => {
            const args: any[] = [];
            const paramsMeta =
              Reflect.getMetadata(
                handler.toString(),
                ControllerCls.prototype
              ) || [];

            paramsMeta.forEach((param: any) => {
              switch (param.type) {
                case "body":
                  args[param.index] = req.body;
                  break;
                case "req":
                  args[param.index] = req;
                  break;
                case "res":
                  args[param.index] = res;
                  break;
                case "next":
                  args[param.index] = next;
                  break;
                case "currentUser":
                  args[param.index] = req.user || {};
                  break;
                default:
                  args[param.index] = undefined;
              }
            });

            const result = await controllerInstance[handler](...args);

            if (result !== undefined && !res.headersSent) {
              res.json(result);
            }
          }
        )
      );
    });
  });
}


export function processModule(
  module: ClassType,
  providerInstances: Map<ClassType, any>
): { controllers: ClassType[]; providers: ClassType[] } {
  const providers = Reflect.getMetadata(PROVIDERS_KEY, module) || [];
  const globalProviders =
    Reflect.getMetadata(GLOBAL_PROVIDERS_KEY, module) || [];

  [...providers, ...globalProviders].forEach((provider: ClassType) => {
    try {
      diContainer.register(provider, {
        useClass: provider,
        global: globalProviders.includes(provider),
      });
      if (!diContainer.isGlobal(provider)) {
        instantiateProvider(provider, providerInstances, [
          ...providers,
          ...globalProviders,
        ]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error processing provider ${provider.name} in module ${module.name}: ${error.message}`
        );
      } else {
        console.error(
          `Unknown error processing provider ${provider.name} in module ${module.name}.`
        );
      }
      throw error;
    }
  });

  const controllers = Reflect.getMetadata(CONTROLLERS_KEY, module) || [];
  const imports = Reflect.getMetadata(IMPORTS_KEY, module) || [];

  imports.forEach((importedModule: ClassType) => {
    try {
      const { controllers: importedControllers, providers: importedProviders } =
        processModule(importedModule, providerInstances);
      controllers.push(...importedControllers);
      providers.push(...importedProviders);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error processing imported module ${importedModule.name} in module ${module.name}: ${error.message}`
        );
      } else {
        console.error(
          `Unknown error processing imported module ${importedModule.name} in module ${module.name}.`
        );
      }
      throw error;
    }
  });

  return { controllers, providers };
}