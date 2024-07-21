import express from "express";
import {  processModule, registerControllers } from "./registerControllers";
import { ClassType } from "../decorators/module";

export function createApp(app: express.Application, mainModule: ClassType) {
  const providerInstances = new Map<ClassType, any>();
  const { controllers, providers } = processModule(
    mainModule,
    providerInstances
  );
  registerControllers(app, controllers, providerInstances, providers);
}
