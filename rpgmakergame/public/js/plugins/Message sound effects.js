//=============================================================================
// メッセージ効果音.js
//=============================================================================

/*:ja
 * v0.5.1
 * @plugindesc
 * メッセージ中にSEを演奏する
 * 
 * @author Declare War
 *
 * @param SeData1
 * @default Open1
 * @desc 演奏するSEのファイル名
 *
 * @param SeData2
 * @default 60
 * @desc 演奏するSEのボリューム
 *
 * @param SeData3
 * @default 100
 * @desc 演奏するSEのピッチ
 *
 * @param SeData4
 * @default 0
 * @desc 演奏するSEのパン
 *
 * @param SeWait
 * @default 2
 * @desc SEの演奏する間隔
 *
 * @param StopSeSw
 * @default 1
 * @desc SEの演奏をやめるスイッチ
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */
 
/*:en
 * @plugindesc
 * messageSe
 * 
 * @author Declare War
 *
 * @param SeData1
 * @default Open1
 * @desc Play Se name
 *
 * @param SeData2
 * @default 60
 * @desc Play Se volume
 *
 * @param SeData3
 * @default 100
 * @desc Play Se pitch
 *
 * @param SeData4
 * @default 0
 * @desc Play Se pan
 *
 * @param SeWait
 * @default 2
 * @desc Duration play Se
 *
 * @param StopSeSw
 * @default 1
 * @desc stop se switch number
 *
 * @help This plugin does not provide plugin commands.
 */

(function(){
	var parameters = PluginManager.parameters('Message sound effects');
	var Params = {};
	Params.seData1 = parameters['SeData1'] || ''
	Params.seData2 = Number(parameters['SeData2'] || 0);
	Params.seData3 = Number(parameters['SeData3'] || 0);
	Params.seData4 = Number(parameters['SeData4'] || 0);
	Params.seWait = Number(parameters['SeWait'] || 2);
	Params.stopSeSw = Number(parameters['StopSeSw'] || 1);
	var MessageSe = new Object();
	MessageSe.name = Params.seData1;
	MessageSe.volume = Params.seData2;
	MessageSe.pitch = Params.seData3;
	MessageSe.pan = Params.seData4;
	// Window_Message  ---------------------------------------------------
	// clearFlags #a
	var _Window_Message_clearFlags = Window_Message.prototype.clearFlags
	Window_Message.prototype.clearFlags = function(){
		_Window_Message_clearFlags.call(this);
		this._seCount = 0;
	};
	// processCharacter #a
	var _Window_Message_processCharacter = Window_Message.prototype.processCharacter
	Window_Message.prototype.processCharacter = function(textState){
		_Window_Message_processCharacter.call(this, this._textState)
		this.messageSePlay();
	};
	// messageSePlay #n
	Window_Message.prototype.messageSePlay = function(){
		if (this.sePlayOk()){
			AudioManager.playSe(MessageSe);
		}
	    this._seCount++;
	};
	// sePlayOk #n
	Window_Message.prototype.sePlayOk = function(){
		if (this._seCount % Params.seWait == 0 && !this._showFast &&
		!$gameSwitches.value(Params.stopSeSw)){
			return true;
		}
		return false;
	};
})();