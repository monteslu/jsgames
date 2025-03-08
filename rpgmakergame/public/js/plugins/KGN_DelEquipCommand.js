//=============================================================================
// KGN_DelEquipCommand.js
//=============================================================================

var Imported = Imported || {};
Imported.KGN_DelEquipCommand = true;

/*:
 * @plugindesc 最強装備とかのコマンドを無くします。
 * @author きぎぬ
 * 
 * @help 
 * 決定キーを無駄に一回多く押す手間がなくなります。やったね、たえちゃん！
 * 装備箇所の表示領域も増えるので、あんまり少ないと寂しいかも。
 * 競合は…するんじゃないでしょうか。既存処理のガチ書き換えです。

 * バグとか自分じゃ太刀打ちできないので、自力で、どうぞ。
 * 
 * HP： http://r3jou.web.fc2.com/

 */

//var Kiginu = Kiginu || {};//パラメータは使わんでしょうこれは



(function() {

//書き換え。邪魔者を排除する。
var Scene_Equip_prototype_create = Scene_Equip.prototype.create;//まあバックアップは取る
Scene_Equip.prototype.create = function() {
	Scene_MenuBase.prototype.create.call(this);
	this.createHelpWindow();
	this.createStatusWindow();
	//this.createCommandWindow();//こいつさえ居なければいい
	this.createSlotWindow();
	this.createItemWindow();
	this.refreshActor();
};

var Scene_Equip_prototype_createSlotWindow = Scene_Equip.prototype.createSlotWindow;//念のためバックアップ
Scene_Equip.prototype.createSlotWindow = function() {
	var wx = this._statusWindow.width;
	//var wy = this._commandWindow.y + this._commandWindow.height;//元の
	var wy = this._helpWindow.height;//コマンドウィンドウが無い分、上に上げる
	var ww = Graphics.boxWidth - this._statusWindow.width;
	//var wh = this._statusWindow.height - this._commandWindow.height;//元の
	var wh = this._statusWindow.height;//コマンドウィンドウが無い分、上下の幅を広げる
	this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
	this._slotWindow.setHelpWindow(this._helpWindow);
	this._slotWindow.setStatusWindow(this._statusWindow);
	this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
	//this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));元の
	this._slotWindow.setHandler('cancel',   this.popScene.bind(this));//メニュー画面に戻るように
	this._slotWindow.setHandler('pagedown', this.nextActor.bind(this));//QとWでアクター切り替えを↓
	this._slotWindow.setHandler('pageup',   this.previousActor.bind(this));//出来るように追加
	this.addWindow(this._slotWindow);
	this._slotWindow.activate();//アイテムスロットをアクティベート
	this._slotWindow.select(0);//一番上のスロットに移動
};

var Scene_Equip_prototype_onActorChange = Scene_Equip.prototype.onActorChange;//バックアップ必要？
Scene_Equip.prototype.onActorChange = function() {
	this.refreshActor();
	//this._commandWindow.activate();元の
	this._slotWindow.activate();//アイテムスロットをアクティベート
	this._slotWindow.select(0);//一番上のスロットに移動
};

})();