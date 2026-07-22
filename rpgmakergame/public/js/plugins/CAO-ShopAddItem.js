//=============================================================================
// CAO-ShopAddItem.js
//=============================================================================

/*:
 * @plugindesc ショップの商品を動的に決定します。
 * @author CACAO
 *
 * @help
 *  プラグインコマンドを使用して、商品の準備・開店を行います。
 *
 *  [Shop prepare]
 *    商品の準備モードにします。
 *    イベントコマンド「ショップの処理」で追加します。
 *
 *  [Shop open]
 *    ショップを起動します。
 *
 *  [Shop open buyonly]
 *    購入のみでショップを起動します。
 *
 *  [Shop cancel]
 *    準備を中止します。
 *    以降、イベントコマンド「ショップの処理」が通常通り処理されます。
 *
 */
(function() {

    var _cao_addgoods_Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(cmd, args) {
        _cao_addgoods_Game_Interpreter_pluginCommand.call(this, cmd, args);
        if (cmd !== 'Shop') return;
        if (args[0] === 'open') {
            $gameTemp.openShop(args[1]==='buyonly');
        } else if (args[0] === 'prepare') {
            $gameTemp.prepareShopGoods();
        } else if (args[0] === 'cancel') {
            $gameTemp.cancelShopAddMode();
        }
    };

    var _cao_Game_Temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        _cao_Game_Temp_initialize.call(this);
        this._isShopAddMode = false;
        this._shopGoods = [];
    };
    Game_Temp.prototype.isShopAddMode = function() {
        return this._isShopAddMode;
    };
    Game_Temp.prototype.prepareShopGoods = function() {
        this._shopGoods = [];
        this._isShopAddMode = true;
    }
    Game_Temp.prototype.cancelShopAddMode = function() {
        this._shopGoods = [];
        this._isShopAddMode = false;
    }
    Game_Temp.prototype.addShopItem = function(item) {
        this._shopGoods.push(item);
    }
    Game_Temp.prototype.openShop = function(buyOnly) {
      if (!$gameParty.inBattle()) {
        this._isShopAddMode = false;
        SceneManager.push(Scene_Shop);
        SceneManager.prepareNextScene(this._shopGoods, buyOnly);
      }
    };

    // Shop Processing
    var _cao_Game_Interpreter_command302 = Game_Interpreter.prototype.command302;
    Game_Interpreter.prototype.command302 = function() {
        if ($gameTemp.isShopAddMode()) {
              $gameTemp.addShopItem(this._params);
              while (this.nextEventCode() === 605) {
                  this._index++;
                  $gameTemp.addShopItem(this.currentCommand().parameters);
              }
        } else {
            return _cao_Game_Interpreter_command302.call(this);
        }
        return true;
    };

})();
