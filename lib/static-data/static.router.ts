import { Router } from "express";
import { StaticSeededData } from "lib/static-data/static.controllers";

const StaticRouter = Router();
const allStaticData = new StaticSeededData();

StaticRouter.route("/locations").get(allStaticData.locations);

StaticRouter.route("/all").get(allStaticData.AllStaticData);

export { StaticRouter };
