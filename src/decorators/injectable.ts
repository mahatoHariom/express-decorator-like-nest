
import { INJECTABLE_METADATA_KEY } from "../domain/@types/constants";
import { diContainer } from "../infrastructure/config/diContainer";
import "reflect-metadata";


export function Injectable(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
  };
}