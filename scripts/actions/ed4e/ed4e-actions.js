import {ActionHandler} from "../actionHandler.js";
import * as settings from "../../settings.js";
import {Logger} from "../../logger.js";

export class ActionHandlerED4e extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }


    doBuildActionList(token, multipleTokens) {
        if (token) {
            return this._buildSingleTokenList(token);
        } else if (multipleTokens) {
            return this._buildMultipleTokenList();
        }
        return this.initializeEmptyActionList();
    }

    async _buildSingleTokenList(token) {
        const list = this.initializeEmptyActionList();
        list.tokenId = token?.id;
        list.actorId = token?.actor?.id;
        if (!list.tokenId || !list.actorId) {
            return list;
        }

        if (settings.get('showHudTitle')) {
            list.hudTitle = token.data?.name;
        }

        const cats = await this._buildCategories(token);
        cats.flat().filter(c => c).forEach(c => {
            this._combineCategoryWithList(list, c.name, c);
        });

        return list;
    }

    _buildCategories(token) {
        let favoriteCat = this._buildFavoritesCategory(token);
        let talentCat = this._buildTalentsCategory(token);
        let matrixCat = this._buildMatrixCategory(token);
        let skillCat = this._buildSkillsCategory(token);
        let itemsCat = this._buildItemsCategory(token);
        let statCat = this._buildStatusCategory(token);
        let combatCat = this._buildCombatCategory(token, itemsCat, [], favoriteCat, statCat);
        return [
            favoriteCat,
            talentCat,
            matrixCat,
            skillCat,
            itemsCat,
            // this._buildAttributesCategory(token),
            // this._buildEffectsCategory(token),
            statCat,
            combatCat
            // this._buildUtilityCategory(token),
            //this._buildPowersCategory(token),

        ]
    }

    _buildFavoritesCategory(token) {
        if (!settings.get("showFavorites")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        const favoriteItems = actor.data.items.filter( e=> e.data.data.favorite === "true");

        let result = this.initializeEmptyCategory('favorites');
        result.name = this.i18n("earthdawn.h.hotlist");

        let favoriteActions = favoriteItems.map(e => {
            try {
                let itemID = e.id;
                let macroType = e.type.toLowerCase();
                let name = e.name;
                if (e.data.data.hasOwnProperty("ranks")) {
                    name += " (" + e.data.data.ranks + ")";
                }
                let encodedValue = [macroType, token.id, itemID].join(this.delimiter);
                return {name: name, id: itemID, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let favoritesCategory = this.initializeEmptySubcategory();
        favoritesCategory.actions = favoriteActions;

        let favoritesTitle = this.i18n("earthdawn.h.hotlist");
        this._combineSubcategoryWithCategory(result, favoritesTitle, favoritesCategory);

        return result;
    }

    _buildTalentsCategory(token) {
        if (!settings.get("showTalents")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        const talents = actor.data.items.filter( e=> e.type === 'talent');

        // get list of talents

        let result = this.initializeEmptyCategory('talents');
        result.name = this.i18n("earthdawn.t.talents");
        let macroType = 'talent';

        let talentActions = talents.map(e => {
            try {
                let talentId = e.id;
                let name = e.name + " (" + e.data.data.ranks + ")";
                let encodedValue = [macroType, token.id, talentId].join(this.delimiter);
                return {name: name, id: talentId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let talentsCategory = this.initializeEmptySubcategory();
        talentsCategory.actions = talentActions;

        let talentsTitle = this.i18n("earthdawn.t.talents");
        this._combineSubcategoryWithCategory(result, talentsTitle, talentsCategory);

        return result;
    }

    _buildMatrixCategory(token) {
        if (!settings.get("showMatrices")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        const matrices = actor.data.items.filter(e=> e.type === 'spellmatrix');
        if (matrices.length < 1) return;

        let result = this.initializeEmptyCategory('matrix');
        result.name = this.i18n("earthdawn.m.matrixes");
        let macroType = 'matrix';

        let spellActions = matrices.map(e => {
            try {
                let matrixId = e.id;
                let name = e.data.data.currentspell;
                let encodedValue = [macroType, token.id, matrixId].join(this.delimiter);
                return {name: name, id: matrixId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let spellsCategory = this.initializeEmptySubcategory();
        spellsCategory.actions = spellActions;

        let spellsTitle = this.i18n("earthdawn.s.spells");
        this._combineSubcategoryWithCategory(result, spellsTitle, spellsCategory);

        return result;
    }

    _buildSkillsCategory(token) {
        if (!settings.get("showSkills")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        const skills = actor.data.items.filter( e=> e.type === 'skill');

        // get list of talents

        let result = this.initializeEmptyCategory('skills');
        result.name = this.i18n("earthdawn.s.skills");
        let macroType = 'skill';

        let skillActions = skills.map(e => {
            try {
                let skillId = e.id;
                let name = e.name + " (" + e.data.data.ranks + ")";
                let encodedValue = [macroType, token.id, skillId].join(this.delimiter);
                return {name: name, id: skillId, encodedValue: encodedValue};
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillActions;

        let skillsTitle = this.i18n("earthdawn.s.skills");
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

        return result;
    }

    _buildItemsCategory(token) {
        if (!settings.get("showInventory")) return;

        const actor = token.actor;
        const tokenId = token.id;

        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        let macroType = 'inventory';

        // get list of items

        let validItems = actor.data.items.filter(i => ['weapon', 'equipment'].indexOf(i.type) > -1);

        let weapons = validItems.filter(i => (i.type === 'weapon') && this._getEntityData(i).worn);
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actor, macroType, w))
            .sort((a,b) => a.name.localeCompare(b.name));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;

        let equipment = validItems.filter(i => i.type === 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actor, macroType, e))
            .sort((a,b) => a.name.localeCompare(b.name));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;

        // make categories

        let weaponsTitle = this.i18n("earthdawn.w.weapons");
        let equipmentTitle = this.i18n("earthdawn.e.equipment")

        let result = this.initializeEmptyCategory('inventory');
        result.name = this.i18n("earthdawn.i.inventory");

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);

        return result;
    }

    _buildItem(tokenId, actor, macroType, item) {
        const itemData = this._getEntityData(item);
        const itemId = item.id ?? item._id;
        let encodedValue = [macroType, tokenId, itemId].join(this.delimiter);
        let img = this._getImage(item);
        return { name: item.name, id: itemId, encodedValue: encodedValue, img: img};
    }

    _buildCombatCategory(token, itemCat=[], matricesCat=[], favoriteCat=[], statusCat=[]) {
        if (!settings.get("showCombat")) return;

        // top category
        let result = this.initializeEmptyCategory("combat");
        result.name = this.i18n("earthdawn.c.combat")

        // weapons
        if (itemCat.length > 0) {
            let weaponSub = itemCat.subcategories[0];
            this._combineSubcategoryWithCategory(result, weaponSub.name, weaponSub);
        }

        // matrices
        if (matricesCat.length > 0) {
            let matrixSub = matricesCat.subcategories[0];
            this._combineSubcategoryWithCategory(result, matrixSub.name, matrixSub)
        }

        // favorites
        if (favoriteCat.length > 0) {
            let favoriteSub = favoriteCat.subcategories[0];
            this._combineSubcategoryWithCategory(result, favoriteSub.name, favoriteSub)
        }

        // tactics
        let tacticsSub = statusCat.subcategories[0];
        this._combineSubcategoryWithCategory(result, tacticsSub.name, tacticsSub)

        // actions



        return result;
    }

    _buildStatusCategory(token) {
        if (!settings.get("showStatusToggle")) return;

        const actor = token.actor;
        if (['pc', 'npc'].indexOf(actor.data.type) < 0) return;

        const macroType = "toggle";

        const tacticsProperties = [
            "tactics.aggressive",
            "tactics.defensive",
            "tactics.harried",
            "tactics.knockeddown"
        ]

        const systemProperties = [
            "usekarma"
        ]

        let tacticsActions = tacticsProperties.map( e => {
                return {
                    name: e, // localize in system
                    id: null,
                    encodedValue: [macroType, token.id, e ].join(this.delimiter),
                    cssClass: actor.data.data.tactics[e.split(".")[1]] === true ? 'active' : ''
                }
            }
        ).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let tacticsCat = this.initializeEmptySubcategory();
        tacticsCat.actions = tacticsActions;


        let systemActions = systemProperties.map( e => {
                return {
                    name: e, // localize in system
                    id: null,
                    encodedValue: [macroType, token.id, e ].join(this.delimiter),
                    cssClass: actor.data.data[e].toLowerCase() === "true" ? 'active' : ''
                }
            }
        ).filter(s => !!s) // filter out nulls
            .sort((a,b) => a.name.localeCompare(b.name));
        let systemCat = this.initializeEmptySubcategory();
        systemCat.actions = systemActions;

        // make categories

        let tacticsTitle = "Tactics"; // localize in system
        let systemTitle = "System"; // localize in system

        let result = this.initializeEmptyCategory('status');
        result.name = 'Status & Toggles'; // localize in system

        this._combineSubcategoryWithCategory(result, tacticsTitle, tacticsCat);
        this._combineSubcategoryWithCategory(result, systemTitle, systemCat);

        return result;
    }

    _getEntityData(entity) {
        return entity.data.data ?? entity.data;
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}