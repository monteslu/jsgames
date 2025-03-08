//=============================================================================
// BMSP.js (BMSPベースプラグイン)
//=============================================================================

/*:
 * @plugindesc BMSPベースプラグインです。
 * @author gentlawk
 * @website http://blueredzone.com
 * @url https://github.com/gentlawk/BMSP_MV
 * @license
 * Copyright(c) 2015 BlueRedZone, gentlawk
 * Released under the MIT license
 * https://github.com/gentlawk/BMSP_MV/blob/master/LICENSE
 *
 * @version 1.11
 *
 * @help
 * 使用方法:
 *   BMSPプラグインシリーズのベースとなるプラグインです。
 *
 * ●追加位置
 *   全てのBMSPプラグインシリーズより上に配置してください。
 */

function BMSP() {
    throw new Error('This is a static class');
}
globalThis.BMSP = BMSP;

/*
 * プラグインの導入チェック
 */
PluginManager._versions = {};

PluginManager.version = function (name) {
    if(!(name.toLowerCase() in this._versions)) return 0;
    return this._versions[name.toLowerCase()];
};

PluginManager.setVersion = function (name, version) {
    this._versions[name.toLowerCase()] = version;
};

BMSP.checkPluginName = function (name) {
    return PluginManager._scripts.indexOf(name) >= 0;
};

BMSP.checkPluginVersion = function (name, version) {
    var now = PluginManager.version(name);
    return now >= version;
};

BMSP.includedPlugin = function (name, version) {
    if (!this.checkPluginName(name)) return false;
    if (version === undefined) return true;
    return this.checkPluginVersion(name, version);
};

BMSP.requirePlugin = function (name, version) {
    if (!this.checkPluginName(name)) {
        throw new Error('no such plugin: ' + name);
    }
    if (version === undefined) return;
    if (!this.checkPluginVersion(name, version)){
        var now = PluginManager.version(name);
        throw new Error('need version ' + version + ' and over: ' + name + ' version ' + now);
    }
};

/*
 * プラグインバージョン
 */
PluginManager.setVersion('BMSP', 1.11);

/*
 * オブジェクトのユニークID管理
 */
BMSP.getUniqueId = function () {
    return new Date().getTime() + Math.floor(Math.random() * 1000);
};

BMSP.getObjectId = function (object) {
    if (!object){
        return 0;
    }
    if (!('_bmsp_object_id' in object)) {
        object._bmsp_object_id = BMSP.getUniqueId();
    }
    return object._bmsp_object_id;
};

/*
 * Ruby(他Perl等)ライクな剰余演算
 */
BMSP.rubyLikeMod = function (a, b) {
    return (a%b+b)%b;
};

/*
 * シャローコピー
 */
BMSP.shallowCopy = function (object) {
    if (object instanceof Array) {
        return [].concat(object);
    }
    var copy = {};
    for (var prop in object) {
        copy[prop] = object[prop];
    }
    return copy;
};