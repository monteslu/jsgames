/*:
-------------------------------------------------------------------------------
@title Equip Slots Core
@author Hime --> HimeWorks (http://himeworks.com)
@date Apr 15, 2016
@version 1.5
@filename HIME_EquipSlotsCore.js
@url http://himeworks.com/2015/11/equip-slots-core/

If you have any questions or concerns, you can contact me at any of
the following sites:

Main Website: http://himeworks.com
Facebook: https://www.facebook.com/himeworkscom/
Twitter: https://twitter.com/HimeWorks
Youtube: https://www.youtube.com/c/HimeWorks
Tumblr: http://himeworks.tumblr.com/
-------------------------------------------------------------------------------
@plugindesc v1.5 - Provides you with tools to set up custom equip slots
for each actor individually.
@help 
-------------------------------------------------------------------------------
== Description ==

Video: https://www.youtube.com/watch?v=fXcA0IdPsPg

By default, RPG Maker gives you 5 equip types to work with:

  Weapon
  Shield
  Head
  Body
  Accessory
  
You also have the ability to add and modify equip slots directly in
the database.

However, one problem you might notice is that every actor will have
those equip slots, even if they can't use any of the equips that you've
designed for those slots.

Another problem is you can't add multiple copies of the same slot to
an actor: they can only have one of each. Want to wear two accessories?
Can't be done.

This plugin solves that problem. It provides ways for you to customize
your actors' equip slots, allowing you to choose exactly which slots
they will have in the game.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Contact me for commercial use

== Change Log ==

1.5 - Apr 15, 2016
 * added support for multiple equip types for equips.
 * standardized the way to check whether an equip slot can hold an item
1.4 - Apr 11, 2016
 * Change the way etype ID is checked
 * Fixed "Change Equipment" command
1.3 - Mar 14, 2016
 * Added support for adding and removing equip slots using script calls
1.2 - Nov 20, 2015
 * updated to support enemy equips
1.1 - Nov 18, 2015
 * updated to support Yanfly's EquipCore
1.0 - Nov 12, 2015
 * initial release

== Usage ==

-- Adding equip slots --

First, if you are using this plugin, the default "Initial equipment" box
will no longer be used. Instead, you will manage all actor equip slots
using note-tags.

To add an equip slot, use the following note tag:

  <equip slot: ETYPE>
  
The ETYPE, which is short for "equip type", is one of the equip types
that you have set up for your project. You can see this in the Types tab.

You can either write the ID of the etype, or you can write the exact name
of the etype. For example, Weapon is equip type 1, so you can write either

  <equip slot: 1>
  <equip slot: Weapon>
  
Depending on your preferences. I would recommend writing out the full
name so that it is clearer, but if you ever change your equip types names
you will need to remember to update these note-tags.

If you would like to add more equip slots, just add more note-tags.
Want 3 weapons and 2 rings, assuming they are in the database?

  <equip slot: Weapon>
  <equip slot: Weapon>
  <equip slot: Weapon>
  <equip slot: Ring>
  <equip slot: Ring>

-- Specifying Initial Equip --

Because the Initial Equipment box is no longer used, you will need to
find another way to specify them.

The equip slot note-tag supports initial equip, using something called an
"Item Code", and is written like this:

  <equip slot: ETYPE ITEMCODE>

An Item code is a quick way to reference a particular weapon, armor, or
item. They look like this:

  a1 - armor 1
  w3 - weapon 3
  i5 - item 5
  
So for example, if you want your actor to have a weapon slot with
weapon 4 from the database as its initial equip, use the note-tag

  <equip slot: Weapon w4>
  
-- Adding and Removing Equip Slots Dynamically --

You may want to add or remove equip slots during the game.
To add an equip slot, use the script call

ACTOR.addEquipSlot(ETYPE)

Where the ACTOR is a reference to a Game_Actor object, and the ETYPE is
the name or ID of the equip slot you want to add.

For example, you can write

  $gameActors.actor(2).addEquipSlot(4)
  $gameActors.actor(2).addEquipSlot("Accessory")
  
To give actor 2 an extra equip slot of type 4 and "Accessory"

Removing slots is done using a similar script call

   ACTOR.removeEquipSlot(ETYPE)
   
For example, if you want to remove the equip slot you added before, you can
write

  $gameActors.actor(2).removeEquipSlot(4)
  $gameActors.actor(2).removeEquipSlot("Accessory")
   
A random equip slot of that type will be removed. If the equip slot contains
an item, the item will be un-equipped and returned to the inventory.

If no such equip slot exists, nothing will happen.

-- Multiple Equip Types --

By default, all equips have one equip type.
You can assign additional equip types using note-tags.

With multiple equip types, you can put on the same equip in multiple slots
of your choice.

To assign additional equip types, note-tag armors or weapons with

  <equip type: TYPE />
  
You can assign as many equip types as you want.
 
-- Custom Scenes --

This plugin provides bare-bones equip slot functionality. The purpose
is to be able to use it with *any* equip scene, whether it is the
default scene or a custom scene.

-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.EquipSlotsCore = 1;
TH.EquipSlotsCore = TH.EquipSlotsCore || {};

function Game_EquipSlot() {
  this.initialize.apply(this, arguments);
};

globalThis.Game_EquipSlot = Game_EquipSlot;

(function ($) {

  $.Regex = /<equip[-_ ]slot:\s+(\w+)(?:\s+(\w)(\d+))?>/img  
  $.EtypeRegex = /<equip[-_ ]type:\s*(.+?)\s*\/>/img

  $.etypeIds = function(obj) {
    if (obj.etypeIds === undefined) {
      obj.etypeIds = [obj.etypeId];
      var res;
      while (res = $.EtypeRegex.exec(obj.note)) {
      
        obj.etypeIds.push($.getEtypeId(res[1]));
      }
    }
    return obj.etypeIds;
  } 
  
  $.etypeNameToId = function(etypeName) {
    if (!$.etypeMap) {
      $.etypeMap = {}
      for (var i = 1; i < $dataSystem.equipTypes.length; i++) {
        var name = $dataSystem.equipTypes[i].toUpperCase();
        $.etypeMap[name] = i;      
      }
    }   
    return $.etypeMap[etypeName.toUpperCase()];
  }

  $.getEtypeId = function(etypeId) {
    if (isNaN(etypeId)) {
      etypeId = $.etypeNameToId(etypeId);
    }
    else {
      etypeId = Math.floor(etypeId)
    }   
    return etypeId;
  };

  Game_EquipSlot.prototype.initialize = function() {
    this._etypeId = 1;
    this._item = new Game_Item();
  };

  Game_EquipSlot.prototype.setEtypeId = function(etypeID) {
    this._etypeId = etypeID;
  };

  Game_EquipSlot.prototype.etypeId = function() {
    return this._etypeId;
  };

  Game_EquipSlot.prototype.setObject = function(item) {
    this._item.setObject(item);
  };

  Game_EquipSlot.prototype.object = function() {
    return this._item.object();
  };

  Game_EquipSlot.prototype.setEquip = function(isWeapon, item) {
    this._item.setEquip(isWeapon, item);
  };
  
  /* Support for multiple equip types */
  Game_EquipSlot.prototype.canEquip = function(item) {
    ids = $.etypeIds(item);
    return ids.contains(this._etypeId);
  }
  
  Game_EquipSlot.prototype.isEtypeId = function(id) {
    return this._etypeId === id;
  };
  
  /***************************************************************************/
  
  var TH_EquipSlotsCore_GameBattler_initMembers = Game_Battler.prototype.initMembers;
  Game_Battler.prototype.initMembers = function() {
    this._equips = [];
    TH_EquipSlotsCore_GameBattler_initMembers.call(this);    
  };
  
  /* Returns equip slot objects */
  Game_Battler.prototype.equipSlotList = function() {
    return this._equips;
  };
    
  /* Returns all of the equip slot types for the battler
   * Purely for backwards compatibility
   */
  Game_Battler.prototype.equipSlots = function() {
    var slots = this._equips;
    var ids = [];
    for (var i = 0; i < slots.length; i++) {
      ids.push(slots[i].etypeId());
    }
    return ids;
  };
  
  Game_Battler.prototype.equips = function() {
    return this._equips.map(function(item) {
        return item.object();
    });
  };
    
  Game_Battler.prototype.initEquips = function(equips) {    
    var baseSlots = this.baseSlots();
    if (baseSlots.length > 0) {
      var maxSlots = baseSlots.length;
      this._equips = [];
      for (var i = 0; i < maxSlots; i++) {
        this._equips[i] = JsonEx.makeDeepCopy(baseSlots[i]);      
      }
      this.releaseUnequippableItems(true);
      this.refresh();
    }
  };
  
  /* Base equip slots for the battler */
  Game_Battler.prototype.baseSlots = function() {
    return [];
  }  
  
  Game_Battler.prototype.getBaseSlots = function(battler) {
    if (!battler.baseEquipSlots) {      
      battler.baseEquipSlots = [];
      var res;
      while (res = $.Regex.exec(battler.note)) {
        var equipSlot = new Game_EquipSlot();
        var etypeId = res[1];
        var itemType = res[2];
        var itemID = res[3];
              
        // /* Not a number. Assume it's the name of an equip type */
        etypeId = $.getEtypeId(etypeId);
        
        equipSlot.setEtypeId(etypeId);        
        if (itemType) {
          equipSlot.setEquip(itemType.toLowerCase() === "w", Math.floor(itemID));
        }
        
        battler.baseEquipSlots.push(equipSlot);
      }
    }
    return battler.baseEquipSlots;
  };
  
  Game_Battler.prototype.weapons = function() {
    return this.equips().filter(function(item) {
      return item && DataManager.isWeapon(item);
    });
  };

  Game_Battler.prototype.armors = function() {
    return this.equips().filter(function(item) {
      return item && DataManager.isArmor(item);
    });
  };
  
  /* Finds the first equip slot with the given equip type */
  Game_Battler.prototype.getSlotByEtypeId = function(etypeId) {
    var slots = this._equips;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].isEtypeId(etypeId)) {
        return i;
      }
    }
  };
  
  /* Overwrite. */
  Game_Battler.prototype.changeEquip = function(slotId, item) {
    if (this.tradeItemWithParty(item, this.equips()[slotId]) &&
            (!item || this.equipSlotList()[slotId].canEquip(item))) {
        this._equips[slotId].setObject(item);
        this.refresh();
    }
  };
  
  /* Ovewrite. We need to find a slot. Assumes 1 is the weapon type */
  Game_Battler.prototype.changeEquipById = function(etypeId, itemId) {
    var slotId = this.getSlotByEtypeId(etypeId);
    if (this.equipSlots()[slotId] === 1) {
        this.changeEquip(slotId, $dataWeapons[itemId]);
    } else {
        this.changeEquip(slotId, $dataArmors[itemId]);
    }
  };  
  
  /* Adds a new equip slot to the actor */
  Game_Battler.prototype.addEquipSlot = function(etypeId) {
    var equipSlot = new Game_EquipSlot();    
    etypeId = $.getEtypeId(etypeId);
    equipSlot.setEtypeId(etypeId);        
    this._equips.push(equipSlot);
  };
  
  /* Removes one instance of the specified equip slot. If an object
   * exists in that slot, the object is un-equipped.
   */
  Game_Battler.prototype.removeEquipSlot = function(etypeId) {
    etypeId = $.getEtypeId(etypeId);
    var slots = this._equips;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].isEtypeId(etypeId)) {
        this.tradeItemWithParty(null, slots[i].object());
        slots.splice(i, 1);
        break;
      }      
    };
  };

  /* Overwrite */
  Game_Battler.prototype.releaseUnequippableItems = function(forcing) {
    for (;;) {
      var slots = this.equipSlotList();
      var slotTypes = this.equipSlots();
      var equips = this.equips();
      var changed = false;
      for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item && (!this.canEquip(item) || !slots[i].canEquip(item))) {
          if (!forcing) {
            this.tradeItemWithParty(null, item);
          }
          this._equips[i].setObject(null);
          changed = true;
        }
      }
      if (!changed) {
          break;
      }
    }
  };
  
  /* Overwrite */
  Game_Battler.prototype.bestEquipItem = function(slotId) {
    var slot = this.equipSlotList()[slotId];
    var etypeId = this.equipSlots()[slotId];
    var items = $gameParty.equipItems().filter(function(item) {
        return slot.canEquip(item) && this.canEquip(item);
    }, this);
    var bestItem = null;
    var bestPerformance = -1000;
    for (var i = 0; i < items.length; i++) {
        var performance = this.calcEquipItemPerformance(items[i]);
        if (performance > bestPerformance) {
            bestPerformance = performance;
            bestItem = items[i];
        }
    }
    return bestItem;
  };
  
  /***************************************************************************/
  
  /* Pulled up */
  var TH_GameActor_equipSlots = Game_Actor.prototype.equipSlots;
  Game_Actor.prototype.equipSlots = function() {
    return Game_Battler.prototype.equipSlots.call(this);    
  };
  
  /* Pulled up */
  Game_Actor.prototype.equips = function() {
    return Game_Battler.prototype.equips.call(this);
  };
  
  /* Pulled up */
  Game_Actor.prototype.weapons = function() {
    return Game_Battler.prototype.weapons.call(this);
  };

  /* Pulled up */
  Game_Actor.prototype.armors = function() {
    return Game_Battler.prototype.armors.call(this);
  };
  
  /* Pulled up */
  var TH_GameActor_initEquips = Game_Actor.prototype.initEquips;
  Game_Actor.prototype.initEquips = function(equips) {    
    Game_Battler.prototype.initEquips.call(this, equips);    
  };
  
  /* Pulled up */
  Game_Actor.prototype.changeEquipById = function(etypeId, itemId) {
    Game_Battler.prototype.changeEquipById.call(this, etypeId, itemId);
  };
  
  /* Pulled up */
  Game_Actor.prototype.changeEquip = function(slotId, item) {  
    Game_Battler.prototype.changeEquip.call(this, slotId, item);
  };  
  
  /* Pulled up */
  Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
    Game_Battler.prototype.releaseUnequippableItems.call(this, forcing);
  };
  
  /* Pulled up */
  Game_Actor.prototype.bestEquipItem = function(slotId) {
    return Game_Battler.prototype.bestEquipItem.call(this, slotId);
  };
  
  /* By default, we check the actor for any equip slots */  
  Game_Actor.prototype.baseSlots = function() {
    var slots = Game_Battler.prototype.baseSlots.call(this);
    return slots.concat(this.getBaseSlots(this.actor()))
  };
    
  /***************************************************************************/
  
  /* Overwrite. Ask if the equip slot can hold the item */
  Window_EquipItem.prototype.includes = function(item) {
    if (item === null) {
        return true;
    }
    if (this._slotId < 0 || !this._actor.equipSlotList()[this._slotId].canEquip(item)) {
        return false;
    }
    return this._actor.canEquip(item);
  };
  
  /***************************************************************************/
  
})(TH.EquipSlotsCore);