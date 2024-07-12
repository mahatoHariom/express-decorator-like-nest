import express from "express";

export function initializeApp(app: express.Application) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
