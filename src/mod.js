"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const LogBackgroundColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogBackgroundColor");
class Mod {
    constructor() {
        this.modConfig = require("../config/config.json");
    }
    postDBLoad(container) {
        const databaseServer = container.resolve("DatabaseServer");
        const tables = databaseServer.getTables();
        const locations = tables.locations;
        const configServer = container.resolve("ConfigServer");
        const logger = container.resolve("WinstonLogger");
        const locConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.LOCATION);
        let itemsList = tables.templates.items;
        const locationNames = [
            "bigmap",
            "factory4_day",
            "factory4_night",
            "interchange",
            "laboratory",
            "lighthouse",
            "rezervbase",
            "shoreline",
            "woods",
            "suburbs",
            "tarkovstreets",
            "terminal",
            "town"
        ];
        for (const location of locationNames) {
            if (this.modConfig.enableRaidTimeChange == true) {
                locations[location].base.EscapeTimeLimit = this.modConfig.universalRaidTime;
            }
            locConfig.looseLootMultiplier[location] = locConfig.looseLootMultiplier[location] * this.modConfig.lootMultiplier;
            //logger.info(`${[location]} loot multiplier: ${locConfig.looseLootMultiplier[location]}`);
        }
        locations.laboratory.base.DisabledForScav = this.modConfig.disableLabScavs;
        ConfigTypes_1.ConfigTypes.InRaid;
        const raidConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.IN_RAID);
        raidConfig.raidMenuSettings.aiDifficulty = this.modConfig.difficultyOfAI;
        raidConfig.raidMenuSettings.aiAmount = this.modConfig.amountOfAI;
        raidConfig.raidMenuSettings.bossEnabled = this.modConfig.enabledBoss;
        raidConfig.raidMenuSettings.scavWars = this.modConfig.scavWars;
        raidConfig.raidMenuSettings.taggedAndCursed = this.modConfig.taggedAndCursed;
        raidConfig.raidMenuSettings.enablePve = this.modConfig.enablePve;
        //Faster deploy time
        tables.globals.config.TimeBeforeDeploy = 2;
        tables.globals.config.TimeBeforeDeployLocal = 2;
        if (this.modConfig.increasedXPMultiplier == true) {
            //Skill XP multiplier
            tables.globals.config.SkillsSettings.SkillProgressRate = this.modConfig.skillMultiplier;
            tables.globals.config.SkillsSettings.WeaponSkillProgressRate = this.modConfig.wepSkillMultiplier;
            //logger.logWithColor(`Skill progress rate set to: ${tables.globals.config.SkillsSettings.SkillProgressRate}`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
            //logger.logWithColor(`Weapon skill progress rate set to: ${tables.globals.config.SkillsSettings.WeaponSkillProgressRate}`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
            //XP multiplier
            tables.globals.config.exp.match_end.miaMult = this.modConfig.miaXPMult;
            tables.globals.config.exp.match_end.survivedMult = this.modConfig.survivedXPMult;
            tables.globals.config.exp.match_end.runnerMult = this.modConfig.runnerXPMult;
            tables.globals.config.exp.match_end.killedMult = this.modConfig.killedXPMult;
            logger.logWithColor(`Increased XP multiplier active!`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
        }
        //Instant Insurance settings
        if (this.modConfig.instantInsurance == true) {
            logger.logWithColor("Instant insurance enabled!", LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
            let traderNames = tables.traders;
            for (let traderID in traderNames) {
                tables.traders[traderID].base.insurance.max_return_hour = 0;
                tables.traders[traderID].base.insurance.min_return_hour = 0;
                tables.traders[traderID].base.insurance.max_storage_time = 7200;
            }
            const insuranceConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.INSURANCE);
            insuranceConfig.runIntervalSeconds = 60;
            logger.logWithColor(`Insurance interval is set to: ${insuranceConfig.runIntervalSeconds}`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
        }
        if (this.modConfig.enableRaidTimeChange == true) {
            logger.logWithColor(`Raid time change enabled!`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
        }
        if (this.modConfig.RemoveInRaidLootingRestrictions == true) {
            logger.logWithColor(`Removing all looting restrictions`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
            for (let id in itemsList) {
                if (itemsList[id]._props.Unlootable == true) {
                    itemsList[id]._props.Unlootable = false;
                    itemsList[id].UnlootableFromSide = [];
                }
            }
        }
        if (this.modConfig.RemoveInRaidCarryRestrictions == true) {
            logger.logWithColor(`Removing in raid carry restrictions`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
            tables.globals.RestrictionsInRaid = [];
        }
        if (this.modConfig.instantHideoutTimes == true) {
            // construction times
            for (let area of tables.hideout.areas)
                for (let stage in area.stages) {
                    area.stages[stage].constructionTime = 2;
                }
            // crafting times
            for (let product of tables.hideout.production) {
                if ((product._id != "5d5c205bd582a50d042a3c0e") & (product._id != "5d5589c1f934db045e6c5492")) {
                    product.productionTime = 2;
                }
                //logger.info(`Craft '${product.endProduct}' overridden to ${product.productionTime} seconds`);
            }
            // scav case times
            for (let scav of tables.hideout.scavcase) {
                scav.ProductionTime = 2;
                //logger.info(`Scav case times overridden to ${scav.ProductionTime} seconds`);
            }
            logger.logWithColor(`Instant hideout times enabled!`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
        }
        logger.logWithColor(`Loot mulitplier set to ${this.modConfig.lootMultiplier}`, LogTextColor_1.LogTextColor.YELLOW, LogBackgroundColor_1.LogBackgroundColor.GREEN);
    }
}
module.exports = { mod: new Mod() };
