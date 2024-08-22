//【Important】all import here need to be webpack.config.js externals

import { app } from "../../scripts/app.js";
import { ComfyApp } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { ComfyUI } from "../../scripts/ui.js";

export const ComnfyUIapp = app;
export const ComnfyUIapi = api;
export const ComnfyUIui = ComfyUI;
export const ComnfyAppClass = ComfyApp;


//get this from __init__.py > server.PromptServer.instance.app.router.add_static()
export const staticPath = '/ComfyUXStatic/'; 