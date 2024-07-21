import "reflect-metadata";
import { Method, Middleware, RouteMetadata } from "../domain/@types/common";

function createRouteDecorator(method: Method) {
  return (path: string, ...middlewares: Middleware[]): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
      if (!Reflect.hasMetadata("routes", target.constructor)) {
        Reflect.defineMetadata("routes", [], target.constructor);
      }
      const routes = Reflect.getMetadata(
        "routes",
        target.constructor
      ) as RouteMetadata[];

      routes.push({
        method,
        path,
        handler: propertyKey as string | symbol,
        middlewares: middlewares,
      });

      Reflect.defineMetadata("routes", routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Delete = createRouteDecorator("delete");
