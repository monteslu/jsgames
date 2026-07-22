// --------------------------------------------------------------------------
// 
// PNDK_FloatingPointVariables
// Copyright (c) 2016 PANDAKO
// This software is released under the MIT License.
// 
// Version:1.0.0	2016/10/26	初版
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc This plugin allows you to assign a decimal to a variable.
 * @author PANDAKO
 *
 * @help
 * There is no Plugin Command for this plugin.
 * 
 * @param numDigits
 * @desc Number digits.
 * If you set 2 then 1.555 will be 1.56.
 * @default 1
 * 
 */
/*:ja
 * @plugindesc 変数に小数を代入できるようにします。
 * @author パンダコ
 *
 * @help
 * イベントコマンド「変数の操作」で小数を利用したい場合は、
 * 「オペランド」の「スクリプト」欄に小数を入力する方法が
 * らくちんです。
 * 
 * このプラグインにプラグインコマンドはありません。
 * 
 * @param numDigits
 * @desc 小数点以下第何位で四捨五入するかの設定
 * 例）2の場合1.555は1.56になります。
 * @default 1
 * 
 */

(function() {
	//プラグインマネージャーで設定されたパラメータを取得
	var parameters = PluginManager.parameters('PNDK_FloatingPointVariables');
	
	//パラメータを変数へ
	var numDigits = parseInt(parameters['numDigits'], 10);
	
	//変数へ代入する際の処理に追記
	var _Game_Variables_prototype_setValue = Game_Variables.prototype.setValue;
	Game_Variables.prototype.setValue = function(variableId, value) {
		_Game_Variables_prototype_setValue.call(this, variableId, value);
		//
		if (variableId > 0 && variableId < $dataSystem.variables.length) {
			if (typeof value === 'number') {
				var lv = 1;
				for (var i = 1; i <= numDigits; i++) {
					lv *= 10;
				}
				value = Math.round(value * lv) / lv;
			}
			this._data[variableId] = value;
			this.onChange();
		}
	}
})();