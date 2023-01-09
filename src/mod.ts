import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IInRaidConfig } from "@spt-aki/models/spt/config/IInRaidConfig";
import { IInsuranceConfig } from "@spt-aki/models/spt/config/IInsuranceConfig";
import { ILocationConfig } from "@spt-aki/models/spt/config/ILocationConfig";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";

class Mod implements IPostDBLoadMod
{
	private modConfig = require("../config/config.json");
	
    public postDBLoad(container: DependencyContainer): void 
    {
		const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
		
		const tables = databaseServer.getTables();
		
		const locations = tables.locations;
		
		const configServer = container.resolve<ConfigServer>("ConfigServer");
		
		const logger = container.resolve<ILogger>("WinstonLogger");
		
		const locConfig = configServer.getConfig<ILocationConfig>(ConfigTypes.LOCATION);
		
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
		
		for (const location of locationNames)
		{
			if (this.modConfig.enableRaidTimeChange == true){
			locations[location].base.EscapeTimeLimit = this.modConfig.universalRaidTime;
			}
			locConfig.looseLootMultiplier[location] = locConfig.looseLootMultiplier[location] * this.modConfig.lootMultiplier;
			//logger.info(`${[location]} loot multiplier: ${locConfig.looseLootMultiplier[location]}`);
		}
		
		locations.laboratory.base.DisabledForScav = this.modConfig.disableLabScavs;
		
		ConfigTypes.InRaid
        const raidConfig = configServer.getConfig<IInRaidConfig>(ConfigTypes.IN_RAID);
		
		raidConfig.raidMenuSettings.aiDifficulty = this.modConfig.difficultyOfAI;
		raidConfig.raidMenuSettings.aiAmount = this.modConfig.amountOfAI;
		raidConfig.raidMenuSettings.bossEnabled = this.modConfig.enabledBoss;
		
		//Faster deploy time
		tables.globals.config.TimeBeforeDeploy = 2;
		tables.globals.config.TimeBeforeDeployLocal = 2;
		
		if (this.modConfig.increasedXPMultiplier == true){
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
		
		logger.logWithColor(`Increased XP multiplier active!`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
		}
		
		//Instant Insurance settings
		if (this.modConfig.instantInsurance == true){
		
        logger.logWithColor("Instant insurance enabled!", LogTextColor.YELLOW, LogBackgroundColor.GREEN);
	
		let traderNames = tables.traders;
		
		for (let traderID in traderNames){
			tables.traders[traderID].base.insurance.max_return_hour = 0;
			tables.traders[traderID].base.insurance.min_return_hour = 0;
			tables.traders[traderID].base.insurance.max_storage_time = 7200;
		}
		
		const insuranceConfig = configServer.getConfig<IInsuranceConfig>(ConfigTypes.INSURANCE);
		insuranceConfig.runIntervalSeconds = 60;
		logger.logWithColor(`Insurance interval is set to: ${insuranceConfig.runIntervalSeconds}`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
		}
		
		if (this.modConfig.enableRaidTimeChange == true){
		logger.logWithColor(`Raid time change enabled!`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
		}
		
		if (this.modConfig.RemoveInRaidLootingRestrictions == true){
		logger.logWithColor(`Removing all looting restrictions`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
			for (let id in itemsList) {
				if (itemsList[id]._props.Unlootable == true){
					
					itemsList[id]._props.Unlootable = false;
					itemsList[id].UnlootableFromSide = [];
				}
			}
		}
		
		if (this.modConfig.RemoveInRaidCarryRestrictions == true) {
		logger.logWithColor(`Removing in raid carry restrictions`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
			tables.globals.RestrictionsInRaid = []
		}
		
		if (this.modConfig.instantHideoutTimes == true){
			// construction times
			for (let area of tables.hideout.areas)
				for (let stage in area.stages) {
					area.stages[stage].constructionTime = 2;
				}
			// crafting times
			for (let product of tables.hideout.production) {
				if ((product._id != "5d5c205bd582a50d042a3c0e") & (product._id != "5d5589c1f934db045e6c5492")){
						product.productionTime = 2;
					}
				//logger.info(`Craft '${product.endProduct}' overridden to ${product.productionTime} seconds`);
			}
			// scav case times
			for (let scav of tables.hideout.scavcase) {
					scav.ProductionTime = 2;
					//logger.info(`Scav case times overridden to ${scav.ProductionTime} seconds`);
			}
			
			logger.logWithColor(`Instant hideout times enabled!`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
		}
		
		logger.logWithColor(`Loot mulitplier set to ${this.modConfig.lootMultiplier}`, LogTextColor.YELLOW, LogBackgroundColor.GREEN);
            
    }
		
    }
}

module.exports = { mod: new Mod() }