import { INJECTABLE_METADATA_KEY } from "../domain/@types/constants";
import { diContainer } from "../infrastructure/config/diContainer";


export function Controller(path: string): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata("path", path, target);
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target); // Mark as injectable
    diContainer.register(target, { useClass: target });
  };
}