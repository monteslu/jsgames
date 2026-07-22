//=============================================================================
// BMSP_MapFog.js (マップフォグ)
//=============================================================================

/*:
 * @plugindesc マップにフォグを表示します。
 * @author gentlawk
 * @website http://blueredzone.com
 * @url https://github.com/gentlawk/BMSP_MV
 * @license
 * Copyright(c) 2015 BlueRedZone, gentlawk
 * Released under the MIT license
 * https://github.com/gentlawk/BMSP_MV/blob/master/LICENSE
 *
 * @version 1.03
 *
 * @param Label
 * @desc マップフォグメモのラベルです。
 * @default フォグ
 *
 * @help
 * マップのメモ:
 *   <フォグ%n%:%name%, %sx%, %sy%, %opacity%, %z%, %blend%, %switchies%>  # マップにフォグを追加します。
 *     - %n% : フォグの番号です。1以上の整数を指定してください。
 *     - %name% : 使用するファイル名です。(初期値: '')
 *     - %sx% : X方向のスピードです。(初期値: 0)
 *     - %sy% : Y方向のスピードです。(初期値: 0)
 *     - %opacity% : 不透明度です。(初期値: 255)
 *     - %z% : Z座標です。0が遠景直上、1がピクチャ直下、2がピクチャ直上です。(初期値: 1)
 *     - %blend% : 合成方法です。0が通常、1が加算です。(初期値: 1)
 *     - %switchies% : 表示条件スイッチIDリストです。条件にしたいスイッチのIDを「:」区切りで指定します。(初期値: 指定無し※常に表示)
 *   ※メモのラベルはパラメータで変更可能です。
 *   ※フォグ番号はマップごとに1から順番に存在しなければなりません。
 *   ※%n%以外の各パラメータは省略可能です。省略した場合初期値が使用されます。
 *   　また、省略したパラメータ以降のパラメータも全て省略しなければなりません。
 *
 * プラグインコマンド:
 *   MapFog %n% name %value% # フォグ番号%n%に使用するファイルを%value%に変更します。
 *   MapFog %n% sx %value% # フォグ番号%n%のX方向速度を%value%に変更します。
 *   MapFog %n% sy %value% # フォグ番号%n%のY方向速度を%value%に変更します。
 *   MapFog %n% opacity %value% # フォグ番号%n%の不透明度を%value%に変更します。
 *   MapFog %n% blend %value% # フォグ番号%n%の合成方法を%value%に変更します。
 *   MapFog %n% visible %value% # フォグ番号%n%を%value%が1で表示、0で非表示にします。
 *
 * 使用方法:
 *   マップのメモにフォグ設定を記述すると、マップにフォグを表示できます。
 *   1つのマップに表示するフォグの数は任意ですが、フォグ番号は1から順番にふる必要があります。
 *   フォグの表示条件はマップ移動時のみ判定されます。
 *   同一マップ上でフォグの表示を切り替える場合はプラグインコマンドを使用して下さい。
 *   マップフォグ画像は以下のディレクトリに配置してください(fogsディレクトリは新規作成してください)。
 *   img/fogs
 *
 * ●使用例
 *   フォグを表示
 *     <フォグ1:fogfile>
 *
 *   フォグを2つ表示
 *     <フォグ1:fogfile1,1,0,255>
 *     <フォグ2:fogfile2,0,0,255,0,0>
 *
 *   スイッチ10がONの時フォグを表示
 *     <フォグ1:fogfile,0,0,255,1,1,10>
 *
 *   スイッチ10がONの時フォグ1を、スイッチ10と20がONの時フォグ2を表示
 *     <フォグ1:fogfile1,0,0,255,1,1,10>
 *     <フォグ2:fogfile2,0,0,255,1,1,10:20>
 */

(function() {

    /*
     * プラグインバージョン
     */
    PluginManager.setVersion('BMSP_MapFog', 1.03);

    /*
     * 必須プラグインチェック
     */
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        BMSP.requirePlugin('BMSP', 1.00);
        _Scene_Boot_start.call(this);
    };

    /*
     * プラグインコマンド
     */
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MapFog') {
            $gameMap.setFogParameter(args[1], Number(args[0]), args[2]);
        }
    };

    /*
     * MapFog
     */
    BMSP.MapFog = function() {
        throw new Error('This is a static class');
    };

    var parameters = PluginManager.parameters('BMSP_MapFog');
    BMSP.MapFog._label  = parameters['Label'];

    BMSP.MapFog._cache_settings = {};

    BMSP.MapFog.getSettings = function(map) {
        var objectId = BMSP.getObjectId(map);
        if(objectId in this._cache_settings){
            return this._cache_settings[objectId];
        }
        var index = 1;
        var settings = {};
        while((this._label + index) in map.meta){
            settings[index] = map.meta[this._label + index].split(',');
            index++;
        }
        this._cache_settings[objectId] = settings;
        return settings;
    };

    BMSP.MapFog.getSprite = function(index) {
        if(!SceneManager._scene || SceneManager._scene.constructor !== Scene_Map) {
            return null;
        }
        var fogData = SceneManager._scene._spriteset._fogData;
        for(var i in fogData) {
            var data = fogData[i];
            if(data.index == index) return data.sprite;
        }
        return null;
    };

    /*
     * ImageManager
     */
    ImageManager.loadFog = function(filename, hue) {
        return this.loadBitmap('img/fogs/', filename, hue, true);
    };

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this.setupFogs();
    };

    Game_Map.prototype.setupFogs = function() {
        this._fogs = {};
        var settings = BMSP.MapFog.getSettings($dataMap);
        for(var index in settings) {
            var setting = settings[index];
            var cond = (setting[6] || '').split(':');
            var visible = true;
            if(cond[0] !== '') {
                visible = cond.every(function(id) {
                    return $gameSwitches.value(id);
                });
            }
            this._fogs[index] = {
                name:    setting[0] || '',
                sx:      Number(setting[1] || 0),
                sy:      Number(setting[2] || 0),
                opacity: Number(setting[3] || 255),
                z:       Number(setting[4] || 1),
                blend:   Number(setting[5] || 1),
                visible: visible,
                x:       0,
                y:       0,
            }
        }
    };

    Game_Map.prototype.fogs = function() {
        return this._fogs;
    }

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        this.updateFogs();
    };

    Game_Map.prototype.updateFogs = function() {
        for(var index in this._fogs) {
            this._fogs[index].x += this._fogs[index].sx;
            this._fogs[index].y += this._fogs[index].sy;
        }
    };

    Game_Map.prototype.setFogParameter = function(name, index, value) {
        if(!(index in this._fogs)) return;
        if(value === undefined) return;
        var fog = this._fogs[index];
        switch(name) {
            case 'name':
                fog[name] = value;
                break;
            case 'sx':
            case 'sy':
            case 'opacity':
            case 'blend':
                fog[name] = Number(value);
                break;
            case 'visible':
                fog[name] = Boolean(Number(value));
                break;
        }
    };

    /*
     * Spriteset_Map
     */
    var _Spriteset_Map_initialize = Spriteset_Map.prototype.initialize;
    Spriteset_Map.prototype.initialize = function() {
        this._fogContainer = [];
        this._fogData = [];
        _Spriteset_Map_initialize.call(this);
    };

    var _Spriteset_Map_createParallax = Spriteset_Map.prototype.createParallax;
    Spriteset_Map.prototype.createParallax = function() {
        _Spriteset_Map_createParallax.call(this);
        this.createFogs(0);
    };

    var _Spriteset_Map_createPictures = Spriteset_Map.prototype.createPictures;
    Spriteset_Map.prototype.createPictures = function() {
        this.createFogs(1);
        _Spriteset_Map_createPictures.call(this);
        this.createFogs(2);
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateFogs();
    };

    Spriteset_Map.prototype.createFogs = function(z) {
        this._fogContainer[z] = new Sprite();
        var fogs = $gameMap.fogs();
        for(var index in fogs) {
            if(fogs[index].z !== z) continue;

            var fogSprite = new TilingSprite();
            fogSprite.move(0, 0, Graphics.width, Graphics.height);
            this._fogContainer[z].addChild(fogSprite);
            this._fogData.push({
                index: index,
                sprite: fogSprite,
                name: null,
            });
        }
        if(z === 2) {
            this.addChild(this._fogContainer[z]);
        } else {
        
            this._baseSprite.addChild(this._fogContainer[z]);
        }
    };

    Spriteset_Map.prototype.updateFogs = function() {
        var fogs = $gameMap.fogs();
        this._fogData.forEach(function(data) {
            var fog = fogs[data.index];
            var sprite = data.sprite;
            if(data.name !== fog.name) {
                data.name = fog.name;
                sprite.bitmap = ImageManager.loadFog(data.name);
            }
            if(sprite.bitmap) {
                sprite.origin.x = fog.x;
                sprite.origin.y = fog.y;
                sprite.opacity = fog.opacity;
                sprite.visible = fog.visible;
                sprite.blendMode = fog.blend;
            }
        }, this);
    };

})();
