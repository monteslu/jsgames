//=============================================================================
// MPP_ChoiceEX.js
//=============================================================================
// Copyright (c) 2018 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.3.7】選択肢の機能拡張
 * @author 木星ペンギン
 *
 * @help 
 * プラグインコマンド:
 *   ChoicePos x y row      # 選択肢の位置(x,y)と行数(row)指定
 *                            rowが未設定の場合、すべての選択肢を表示する
 *   ChoiceVariableId n     # 選択肢のデフォルト位置を変数n番にする
 *                            選択中の位置を変数n番にいれる
 *   ChoiceRect x y width height
 *                          # 選択肢の座標とサイズ(x,y,width,height)指定
 *                            各項目 -1 でデフォルト値
 * 
 * 注釈:
 *   選択肢ヘルプ             # 各項目の下に設定することでヘルプを表示させる
 *
 * 選択肢テキスト:
 *   if(条件)                # 条件が偽になると項目が表示されなくなる
 *   en(条件)                # 条件が偽になると項目が選択不可
 *
 * ================================
 * ●選択肢を増やす
 *  イベントコマンド『選択肢の表示』を続けて配置すると
 *  一つの選択肢にまとめられます。
 *  まとめたくない場合は、間に注釈などを入れることで通常通り分けることができます。
 * 
 *  『デフォルト』の処理は、なし以外を設定したものが適用されます。
 *  『デフォルト』の処理が複数ある場合、
 *  後に設定された選択肢のものが適用されます。
 * 
 *  『キャンセル』の処理は、禁止以外を設定したものが適用されます。
 *  『キャンセル』の処理が複数ある場合、
 *  後に設定された選択肢のものが適用されます。
 * 
 * 『背景』と『ウィンドウ位置』は後の選択肢のものが適用されます。
 * 
 *
 * ●項目が表示される条件の設定
 *  選択肢の文章中に
 *    if(条件)
 *  と入れ、その条件が偽になると項目が表示されなくなります。
 * 
 *  条件内では s でスイッチ、v で変数を参照できます。
 *  （例：if(s[1]) とした場合、スイッチ１番がONで表示、OFFで非表示となります）
 * 
 *  『デフォルト』や『キャンセル』の項目が表示されない場合、
 *  なしや禁止と同じ処理をします。
 * 
 *
 * ●項目を半透明で表示する条件の設定
 *  選択肢の文章中に
 *    en(条件)
 *  と入れ、その条件が偽になると項目が半透明で表示されます。
 *  半透明となった項目は選択できなくなります。
 * 
 *  条件は上の『項目が表示される条件の設定』と同じです。
 * 
 *  『キャンセル』の項目が半透明の場合、ブザーが鳴ります。
 * 
 *
 * ●選択肢のカーソル位置指定と保存
 *  イベントコマンドの【プラグインコマンド】にて以下のように入力すると
 *  次に表示する選択肢のデフォルト位置を変数の値にして、
 *  決定またはキャンセル時にカーソル位置をその変数に入れます。
 * 
 *   ChoiceVariableId n
 *     n : 変数番号
 * 
 * カーソル位置は最初の選択肢が上から0～5、次の選択肢は10～15と、
 * 選択肢毎に+10されます。
 * 
 * 変数に入った値の項目がない場合、なしと同じ処理をします。
 * 
 *
 * ●プラグインコマンドの実行タイミング
 *  上記のプラグインコマンドを使用する場合、【選択肢の表示】の前に実行するのが
 *  好ましいです。
 *  ただし、メッセージウィンドウを表示したまま選択肢の処理を実行したい場合、
 *  【文章の表示】より前にプラグインコマンドを実行してください。
 * 
 * ●ヘルプメッセージの表示
 *  各選択肢項目の下に注釈で以下の文字列を入れると、
 *  続きの文章をヘルプメッセージとしてカーソルを合わせたときに
 *  標示させることができます。
 *  
 *    選択肢ヘルプ
 * 
 *  ※注意点
 *   ヘルプメッセージは[文章の表示]と同じ機能を使っているため、制御文字が使用できます。
 *   ただし、\!と\^は使用できません。
 *  
 * ================================
 * ▼コマンドの名前変更について
 *  プラグインコマンドや注釈で使用するコマンドは、
 *  プラグインパラメータから変更できます。
 *  
 *  コマンドを短くしたり日本語にしたりなどして、自分が使いやすいようにしてください。
 *  
 *  プラグインコマンドのみ、変更後もデフォルトのコマンドでも動作します。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 *
 * @param maxPageRow
 * @desc 1ページに表示される行数
 * @default 6
 *
 * @param === Command ===
 * 
 * @param Plugin Commands
 * @type struct<Plugin>
 * @desc プラグインコマンド名
 * @default {"ChoicePos":"ChoicePos","ChoiceVariableId":"ChoiceVariableId","ChoiceRect":"ChoiceRect"}
 * @parent === Command ===
 * 
 * @param Event Comment
 * @type struct<EventComment>
 * @desc イベントメモ欄のデータ名
 * @default {"ChoiceHelp":"選択肢ヘルプ"}
 * @parent === Command ===
 * 
 */

/*~struct~Plugin:
 * @param ChoicePos
 * @desc 選択肢の位置(x,y)と行数(row)指定
 * @default ChoicePos
 *
 * @param ChoiceVariableId
 * @desc 選択肢のデフォルト位置を変数n番にする
 * @default ChoiceVariableId
 *
 * @param ChoiceRect
 * @desc 選択肢の座標とサイズ(x,y,width,height)指定
 * @default ChoiceRect
 *
 */

/*~struct~EventComment:
 * @param ChoiceHelp
 * @desc 各項目の下に設定することでヘルプを表示させる
 * @default 選択肢ヘルプ
 */

(function() {

var MPPlugin = {};

(function() {
    
    var parameters = PluginManager.parameters('MPP_ChoiceEX');
    
    MPPlugin.maxPageRow = Number(parameters['maxPageRow']);
    
    MPPlugin.PluginCommands = JSON.parse(parameters['Plugin Commands']);
    MPPlugin.EventComment = JSON.parse(parameters['Event Comment']);

})();

var Alias = {};

//-----------------------------------------------------------------------------
// Game_Message

//15
Alias.GaMe_clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function() {
    Alias.GaMe_clear.call(this);
    this._choiceEnables = [];
    this._choiceResults = [];
    this._helpTexts = [];
    this._choiceX = -1;
    this._choiceY = -1;
    this._choiceWidth = -1;
    this._choiceHeight = -1;
    this._choiceMaxRow = MPPlugin.maxPageRow;
    this._choiceVariableId = 0;
};

Game_Message.prototype.setChoiceEnables = function(enables) {
    this._choiceEnables = enables;
};

Game_Message.prototype.choiceEnables = function() {
    return this._choiceEnables;
};

Game_Message.prototype.setChoiceResults = function(results) {
    this._choiceResults = results;
};

Game_Message.prototype.setChoiceHelpTexts = function(texts) {
    this._helpTexts = texts;
};

Game_Message.prototype.isHelp = function() {
    return this._helpTexts.length > 0;
};

Game_Message.prototype.setChoicePos = function(x, y, row) {
    this._choiceX = x;
    this._choiceY = y;
    this._choiceWidth = -1;
    this._choiceHeight = -1;
    this._choiceMaxRow = row;
};

Game_Message.prototype.setChoiceRect = function(x, y, width, height) {
    this._choiceX = x;
    this._choiceY = y;
    this._choiceWidth = width;
    this._choiceHeight = height;
};

Game_Message.prototype.setChoiceVariableId = function(id) {
    this._choiceVariableId = id;
};

//-----------------------------------------------------------------------------
// Game_Interpreter

//336
Game_Interpreter.prototype.setupChoices = function(params) {
    var data = {
        choices: [],
        enables: [],
        results: [],
        helpTexts: [],
        cancelType: -1,
        defaultType: -1,
        positionType: 0,
        background: 0
    };
    data = this.addChoices(params, this._index, data, 0);
    if (data.choices.length > 0) {
        var helpTexts = [];
        if (data.helpTexts.length > 0) {
            helpTexts = data.results.map(function(i) {
                return data.helpTexts[i];
            });
        }
        var cancelType = -1;
        if (data.cancelType.mod(10) === 8 || data.results.contains(data.cancelType)) {
            data.results.push(data.cancelType);
            cancelType = data.choices.length;
        }
        var defaultType = -1;
        if ($gameMessage._choiceVariableId > 0) {
            var index = $gameVariables.value($gameMessage._choiceVariableId);
            defaultType = data.results.indexOf(index);
        } else {
            defaultType = data.results.indexOf(data.defaultType);
        }
        $gameMessage.setChoices(data.choices, defaultType, cancelType);
        $gameMessage.setChoiceEnables(data.enables);
        $gameMessage.setChoiceResults(data.results);
        $gameMessage.setChoiceHelpTexts(helpTexts);
        $gameMessage.setChoiceBackground(data.background);
        $gameMessage.setChoicePositionType(data.positionType);
        $gameMessage.setChoiceCallback(function(n) {
            this._branch[this._indent] = data.results[n];
        }.bind(this));
    } else {
        this._branch[this._indent] = -1;
    }
};

Game_Interpreter.prototype.addChoices = function(params, i, data, d) {
    var regIf = /\s*if\(([^\)]+)\)/;
    var regEn = /\s*en\(([^\)]+)\)/;
    for (var n = 0; n < params[0].length; n++) {
        var str = params[0][n];
        if (regIf.test(str)) {
            str = str.replace(regIf, '');
            if (RegExp.$1 && !this.evalChoice(RegExp.$1)) continue;
        }
        var enable = true;
        if (regEn.test(str)) {
            str = str.replace(regEn, '');
            enable = this.evalChoice(RegExp.$1);
        }
        data.choices.push(str);
        data.enables.push(enable);
        data.results.push(n + d);
    }
    var cancelType = params[1];
    if (cancelType !== -1) {
        data.cancelType = cancelType + d;
    }
    var defaultType = params.length > 2 ? params[2] : 0;
    if (defaultType >= 0) {
        data.defaultType = defaultType + d;
    }
    data.positionType = params.length > 3 ? params[3] : 2;
    data.background = params.length > 4 ? params[4] : 0;
    var command;
    for (;;) {
        i++;
        command = this._list[i];
        if (!command) break;
        if (command.indent === this._indent) {
            if (command.code === 402) {
                this.getHelpText(command.parameters[0] + d, i + 1, data);
            } else if (command.code === 404) {
                break;
            }
        }
    }
    command = this._list[i + 1];
    if (command && command.code === 102) {
        this.addChoices(command.parameters, i + 1, data, d + 10);
    }
    return data;
};

Game_Interpreter.prototype.getHelpText = function(c, i, data) {
    var command = MPPlugin.EventComment.ChoiceHelp || '選択肢ヘルプ';
    if (this._list[i].code === 108 && this._list[i].parameters[0] === command) {
        var texts = [];
        while (this._list[i + 1].code === 408) {
            i++;
            texts.push(this._list[i].parameters[0]);
        }
        data.helpTexts[c] = texts;
    }
};

Game_Interpreter.prototype.evalChoice = function(formula) {
    try {
        var s = $gameSwitches._data;
        var v = $gameVariables._data;
        return !!eval(formula);
    } catch (e) {
        alert("条件エラー \n\n " + formula);
        return true;
    }
};

//362
Game_Interpreter.prototype.command403 = function() {
    if (this._branch[this._indent] !== -2) {
        this.skipBranch();
    }
    return true;
};

Game_Interpreter.prototype.command404 = function() {
    if (this.nextEventCode() === 102) {
        this._branch[this._indent] -= 10;
        this._index++;
    }
    return true;
};

//1739
Alias.GaIn_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Alias.GaIn_pluginCommand.call(this, command, args);
    switch (command) {
    case MPPlugin.PluginCommands.ChoicePos: case 'ChoicePos':
        var x = Number(args[0]);
        var y = Number(args[1]);
        var row = Number(args[2] || 99);
        $gameMessage.setChoicePos(x, y, row);
        break;
    case MPPlugin.PluginCommands.ChoiceVariableId: case 'ChoiceVariableId':
        $gameMessage.setChoiceVariableId(Number(args[0]));
        break;
    case MPPlugin.PluginCommands.ChoiceRect: case 'ChoiceRect':
        var x = Number(args[0] || -1);
        var y = Number(args[1] || -1);
        var width = Number(args[2] || -1);
        var height = Number(args[3] || -1);
        $gameMessage.setChoiceRect(x, y, width, height);
        break;
    }
    return true;
};

//-----------------------------------------------------------------------------
// Window_ChoiceList

if (Window_ChoiceList.prototype.hasOwnProperty('close')) {
    Alias.WiChLi_close = Window_ChoiceList.prototype.close
}
Window_ChoiceList.prototype.close = function() {
    if ($gameMessage.isHelp()) this._messageWindow.onShowFast();
    if (Alias.WiChLi_close) {
        Alias.WiChLi_close.call(this);
    } else {
        Window_Command.prototype.close.call(this);
    }
};

if (Window_ChoiceList.prototype.hasOwnProperty('update')) {
    Alias.WiChLi_update = Window_ChoiceList.prototype.update
}
Window_ChoiceList.prototype.update = function() {
    var lastIndex = this.index();
    if (Alias.WiChLi_update) {
        Alias.WiChLi_update.call(this);
    } else {
        Window_Command.prototype.update.call(this);
    }
    var variableId = $gameMessage._choiceVariableId;
    if (lastIndex !== this.index() && variableId > 0) {
        var results = $gameMessage._choiceResults;
        $gameVariables.setValue(variableId, results[this.index()]);
    }
};

//34
Alias.WiChLi_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
Window_ChoiceList.prototype.updatePlacement = function() {
    Alias.WiChLi_updatePlacement.call(this);
    if ($gameMessage._choiceWidth >= 0) {
        this.width = Math.min($gameMessage._choiceWidth, Graphics.boxWidth);
    }
    if ($gameMessage._choiceHeight >= 0) {
        this.height = Math.min($gameMessage._choiceHeight, Graphics.boxHeight);
    }
    if ($gameMessage._choiceX >= 0) {
        this.x = Math.min($gameMessage._choiceX, Graphics.boxWidth - this.width);
    }
    if ($gameMessage._choiceY >= 0) {
        this.y = Math.min($gameMessage._choiceY, Graphics.boxHeight - this.height);
    }
};

//67
Window_ChoiceList.prototype.numVisibleRows = function() {
    return Math.min($gameMessage.choices().length, $gameMessage._choiceMaxRow);
};

//103
Window_ChoiceList.prototype.makeCommandList = function() {
    var choices = $gameMessage.choices();
    var enables = $gameMessage._choiceEnables;
    for (var i = 0; i < choices.length; i++) {
        this.addCommand(choices[i], 'choice', enables[i]);
    }
};

//110
Alias.WiChLi_drawItem = Window_ChoiceList.prototype.drawItem;
Window_ChoiceList.prototype.drawItem = function(index) {
    this.changePaintOpacity(this.isCommandEnabled(index));
    Alias.WiChLi_drawItem.call(this, index);
};

//123
Alias.WiChLi_callOkHandler = Window_ChoiceList.prototype.callOkHandler;
Window_ChoiceList.prototype.callOkHandler = function() {
    Alias.WiChLi_callOkHandler.call(this);
    this._messageWindow.forceClear();
};

//129
Alias.WiChLi_callCancelHandler = Window_ChoiceList.prototype.callCancelHandler;
Window_ChoiceList.prototype.callCancelHandler = function() {
    Alias.WiChLi_callCancelHandler.call(this);
    this._messageWindow.forceClear();
};

if (Window_ChoiceList.prototype.hasOwnProperty('processCancel')) {
    Alias.WiChLi_processCancel = Window_ChoiceList.prototype.processCancel
}
Window_ChoiceList.prototype.processCancel = function() {
    var type = $gameMessage.choiceCancelType();
    var results = $gameMessage._choiceResults;
    var index = results.indexOf(results[type]);
    if (this.isCancelEnabled() && index !== type && !this.isCommandEnabled(index)) {
        this.playBuzzerSound();
    } else {
        if (Alias.WiChLi_processCancel) {
            Alias.WiChLi_processCancel.call(this);
        } else {
            Window_Command.prototype.processCancel.call(this);
        }
    }
};

Window_ChoiceList.prototype.callUpdateHelp = function() {
    if (this.active && this._messageWindow && $gameMessage.isHelp()) {
        this.updateHelp();
    }
};

Window_ChoiceList.prototype.updateHelp = function() {
    this._messageWindow.forceClear();
    var texts = $gameMessage._helpTexts[this.index()];
    $gameMessage._texts = texts ? texts.clone() : [''];
    this._messageWindow.startMessage();
};


//-----------------------------------------------------------------------------
// Window_Message

//149
Alias.WiMe_updateInput = Window_Message.prototype.updateInput;
Window_Message.prototype.updateInput = function() {
    if ($gameMessage.isHelp() && this._textState) {
        return false;
    }
    return Alias.WiMe_updateInput.call(this);
};

//207
Alias.WiMe_startInput = Window_Message.prototype.startInput;
Window_Message.prototype.startInput = function() {
    if (this._choiceWindow.active) {
        return true;
    }
    return Alias.WiMe_startInput.call(this);
};

Window_Message.prototype.forceClear = function() {
    this._textState = null;
    this.close();
    this._goldWindow.close();
};

Window_Message.prototype.onShowFast = function() {
    this._showFast = true;
};

//196
Alias.WiMe_onEndOfText = Window_Message.prototype.onEndOfText;
Window_Message.prototype.onEndOfText = function() {
    if ($gameMessage.isHelp() && !this._choiceWindow.active) {
        this.startInput();
    } else {
        Alias.WiMe_onEndOfText.call(this);
    }
};






})();
