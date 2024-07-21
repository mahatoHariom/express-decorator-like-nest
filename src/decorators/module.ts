import "reflect-metadata";
import { diContainer } from "../infrastructure/config/diContainer";
import { GLOBAL_PROVIDERS_KEY } from "../domain/@types/constants";

export const CONTROLLERS_KEY = "controllers";
export const PROVIDERS_KEY = "providers";
export const IMPORTS_KEY = "imports";
export const DESIGN_PARAM_TYPES = "design:paramtypes";

export interface ClassType<T = any> {
  new (...args: any[]): T;
}



export interface ModuleMetadata {
  controllers?: ClassType[];
  providers?: ClassType[];
  imports?: ClassType[];
  globalProviders?: ClassType[];
}


export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CONTROLLERS_KEY, metadata.controllers, target);
    Reflect.defineMetadata(PROVIDERS_KEY, metadata.providers, target);
    Reflect.defineMetadata(IMPORTS_KEY, metadata.imports, target);
    Reflect.defineMetadata(
      GLOBAL_PROVIDERS_KEY,
      metadata.globalProviders,
      target
    );

    // Register imports first
    (metadata.imports || []).forEach((importedModule) => {
      const importedMetadata = Reflect.getMetadata(
        "module:metadata",
        importedModule
      ) as ModuleMetadata;
      if (importedMetadata) {
        Module(importedMetadata)(importedModule);
      }
    });

    // Register providers and global providers
    (metadata.providers || []).forEach((provider) => {
      diContainer.register(provider, { useClass: provider });
    });

    (metadata.globalProviders || []).forEach((provider) => {
      diContainer.register(provider, { useClass: provider, global: true });
    });

    // Controllers will be processed separately
  };
}