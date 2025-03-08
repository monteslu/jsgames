//=============================================================================
// マップフリーズプラグイン
// mapFreeze.js
// Copyright (c) 2018 村人Ａ
//=============================================================================

/*:ja
 * @plugindesc マップ上においてブラーのかかった画面キャプチャを表示し、マップ上のイベントを停止します。
 * @author 村人A
 *
 * @help このプラグインはデフォルトのメニュー画面を開いた時のような状態を任意に発生させます。
 プラグインコマンド"waitBlur mOn"でメッセージ表示時にマップにブラー＆停止させるようにします。
 プラグインコマンド"waitBlur mOff"で↑を解除します。
 プラグインコマンド"waitBlur cOn"で選択肢表示時にマップにブラー＆停止させるようにします。
 プラグインコマンド"waitBlur cOff"で↑を解除します。
 プラグインコマンド"waitBlur on"で発生時の任意の時にマップにブラー＆停止させます。
 プラグインコマンド"waitBlur on commonOn"で発生時の任意の時にコモンイベントは有効にしたままマップに
 ブラー＆停止させます。
 プラグインコマンド"waitBlur off"で↑を解除します。
 全てのイベント発生時に正常に動作するかはテストしてないため、もしうまくいかない場面がありましたら
 教えてください。
 製作ブログ
 http://ameblo.jp/rpgmaker1892/
 */

(function() {
	globalThis.villaA_waitBlur_switch_choice_On = false;
	globalThis.villaA_waitBlur_switch_choice = false;
	globalThis.villaA_waitBlur_switch_message_On = false;
	globalThis.villaA_waitBlur_switch_message = false;
	globalThis.villaA_waitBlur_switch_snapBack = false;
	globalThis.villaA_waitBlur_switch_on = false;
	globalThis.villaA_waitBlur_switch_common_On = false;
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'waitBlur') {
			if(args[0] == "mOn"){
				villaA_waitBlur_switch_message_On = true;
			} else if(args[0] == "mOff"){
				villaA_waitBlur_switch_message_On = false;
			} else if(args[0] == "cOn"){
				villaA_waitBlur_switch_choice_On = true;
			} else if(args[0] == "cOff"){
				villaA_waitBlur_switch_choice_On = false;
			} else if(args[0] == "on"){
				villaA_waitBlur_switch_on = true;
				if(args[1] == "commonOn"){
					villaA_waitBlur_switch_common_On = true;
				}
			} else if(args[0] == "off"){
				villaA_waitBlur_switch_on = false;
				villaA_sprite_blurSnapImg.visible = false;
				villaA_waitBlur_switch_snapBack = false;
				villaA_waitBlur_switch_common_On = false;
			}
        }
    };
	
	Game_Interpreter.prototype.command102 = function() {
		if (!$gameMessage.isBusy()) {
			if(villaA_waitBlur_switch_choice_On)villaA_waitBlur_switch_choice = true
			this.setupChoices(this._params);
			this._index++;
			this.setWaitMode('message');
		}
		return false;
	};

	Window_Base.prototype.updateClose = function() {
		if (this._closing) {
			if(villaA_waitBlur_switch_message_On){
				if(villaA_waitBlur_switch_message){
					villaA_waitBlur_switch_message = false;
					villaA_waitBlur_switch_snapBack = false
					villaA_sprite_blurSnapImg.visible = false;
				}
			}
			this.openness -= 32;
			if (this.isClosed()) {
				this._closing = false;
			}
		}
	}
	
	Game_Interpreter.prototype.command101 = function() {
		if (!$gameMessage.isBusy()) {
			$gameMessage.setFaceImage(this._params[0], this._params[1]);
			$gameMessage.setBackground(this._params[2]);
			$gameMessage.setPositionType(this._params[3]);
			while (this.nextEventCode() === 401) {  // Text data
				this._index++;
				$gameMessage.add(this.currentCommand().parameters[0]);
				if(villaA_waitBlur_switch_message_On)villaA_waitBlur_switch_message = true;
			}
			switch (this.nextEventCode()) {
			case 102:  // Show Choices
				if(villaA_waitBlur_switch_choice_On)villaA_waitBlur_switch_choice = true
				this._index++;
				this.setupChoices(this.currentCommand().parameters);
				break;
			case 103:  // Input Number
				this._index++;
				this.setupNumInput(this.currentCommand().parameters);
				break;
			case 104:  // Select Item
				this._index++;
				this.setupItemChoice(this.currentCommand().parameters);
				break;
			}
			this._index++;
			this.setWaitMode('message');
		}
		return false;
	};

	Game_Interpreter.prototype.setupChoices = function(params) {
		var choices = params[0].clone();
		var cancelType = params[1];
		var defaultType = params.length > 2 ? params[2] : 0;
		var positionType = params.length > 3 ? params[3] : 2;
		var background = params.length > 4 ? params[4] : 0;
		if (cancelType >= choices.length) {
			cancelType = -2;
		}
		$gameMessage.setChoices(choices, defaultType, cancelType);
		$gameMessage.setChoiceBackground(background);
		$gameMessage.setChoicePositionType(positionType);
		$gameMessage.setChoiceCallback(function(n) {
			this._branch[this._indent] = n;
			if(villaA_waitBlur_switch_choice_On){
				villaA_waitBlur_switch_choice = false
				villaA_waitBlur_switch_snapBack = false
				villaA_sprite_blurSnapImg.visible = false;
			}
		}.bind(this));
	};
	
	Game_Map.prototype.update = function(sceneActive) {
		this.refreshIfNeeded();
		if (sceneActive) {
			this.updateInterpreter();
		}
		this.updateScroll();
		if(!villaA_waitBlur_switch_choice && !villaA_waitBlur_switch_message && !villaA_waitBlur_switch_on){
			this.updateEvents();
			this.updateParallax();
		} else {
			if(villaA_waitBlur_switch_common_On){
				this._commonEvents.forEach(function(event) {
					event.update();
				});
			}
		}
		this.updateVehicles();
	}

	Game_Player.prototype.update = function(sceneActive) {
		var lastScrolledX = this.scrolledX();
		var lastScrolledY = this.scrolledY();
		var wasMoving = this.isMoving();
		this.updateDashing();
		if(!villaA_waitBlur_switch_choice && !villaA_waitBlur_switch_message && !villaA_waitBlur_switch_on){
			if (sceneActive) {
				this.moveByInput();
			}
		}
		Game_Character.prototype.update.call(this);
		this.updateScroll(lastScrolledX, lastScrolledY);
		this.updateVehicle();
		if (!this.isMoving()) {
			this.updateNonmoving(wasMoving);
		}
		this._followers.update();
	};

	Spriteset_Base.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.updateScreenSprites();
		this.updateToneChanger();
		this.updatePosition();
		if(villaA_waitBlur_switch_choice || villaA_waitBlur_switch_message || villaA_waitBlur_switch_on){
			if(villaA_waitBlur_switch_snapBack == false){
				if(typeof(villaA_sprite_blurSnapImg) != 'undefined'){
					this.removeChild(villaA_sprite_blurSnapImg);
				}
				globalThis.villaA_sprite_blurSnapImg = new Sprite();
				villaA_sprite_blurSnapImg.bitmap = SceneManager.snap();
				villaA_sprite_blurSnapImg.bitmap.blur();
				villaA_sprite_blurSnapImg.visible = true;
				villaA_sprite_blurSnapImg.z = 10
				this._tilemap.addChild(villaA_sprite_blurSnapImg);
				villaA_waitBlur_switch_snapBack = true
			}
		}
	};
})();