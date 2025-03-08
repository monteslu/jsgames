//=============================================================================
// 111_InputForm.js (Sep. 2017 by Sasuke KANNAZUKI, et al.)
//=============================================================================
// [Update History]
// 2017 Apr    : First Release by Sasuke KANNAZUKI
// 2017 Sep 06 : Add code to prevent error on iOS (thanks to Kuramubon).

/*:
 * @plugindesc Display input form on the game screen
 * @author Sasuke KANNAZUKI, 111, Kuramubon
 *
 * @param OK Button Text
 * @desc Text of OK Button
 * @default OK
 *
 * @param Display Cancel Button
 * @desc Whether to display cancel button.(0=no, 1=yes)
 * @default 1
 *
 * @param Cancel Button Text
 * @desc Text of Cancel Button
 * @default Cancel
 *
 * @param Judge Switch Interval
 * @desc Interval milisecond of checking the switch.
 * By reducing number, more sensitive, maybe overload.
 * @default 100
 *
 * @param Switch ID Selected OK
 * @desc Turn ON when OK pressed, turn OFF when Cancel pressed.
 * if the ID is 0, no effect.
 * @default 0
 *
 * @param Force OK Switch ID
 * @desc When the switch ON, input form is forcely decided.
 * (i.e. this is the default value of if_s.) If the ID is 0, no effect.
 * @default 0
 *
 * @param Force Cancel Switch ID
 * @desc When the switch ON, input form is forcely cancelled.
 * If the ID is 0, no effect.
 * @default 0
 *
 * @help
 * This plugin enables player to input string by using HTML5+CSS functions.
 * 
 * [At first you have to do]
 * This plugin needs another css file that is attached in the archive
 * whose name is "111_InputForm.css".
 * Please make the "css" folder at the same folder as index.html,
 * and then put the css file.
 * If you have the knowledge of css, you can easily change the style of the
 * form by overwriting the css file.
 * 
 * [Plugin Command Example]
 * Parameters should be separated by semi colon(never use white space!),
 * and each parameter's style is <name>=<value>, as follows:
 *
 * InputForm x=350;y=200;n=1;max=5;
 *
 * At this case, form appears at (350, 200), the result string is stored at
 * actor #1's name, and the maximum string length is 5.
 * If you omit max=5; from the parameter, player can input limitless length.
 * 
 * Even if you set maximum string length, player can input limitless length
 * string, but the string is truncated when the input form is closed.
 * This rule is also applied when the form is forcely terminated (to explain
 * below).
 *
 * If you omit x=350; and/or y=200; from the parameter, the position become
 * center of the screen. But when message window is displaying at center of
 * the screen, y position become below of the message window.
 *
 * You also can use variable as to store string like the following notation:
 * v=11;
 * In this case, variable #11's value become the result string,
 * v=Aooni;
 * In this case, the target is the variable whose name is Aooni.
 * (note: you cannot specify the variable name that include white space.)
 * but it's deprecated, because variable is not supporsed to store string.
 *
 * [Advanced option 1 : force termination by switch condition]
 * You also can set time limit of input.
 * For example, when you add if_s=3; to the parameter of above plugin
 * command, the input form will be forcely closed when the switch #3 become ON
 * (You can implement such a process by using a parallel event).
 * 'force_ok_sw' is the alias of 'if_s', so force_ok_sw=3; is equivalent to
 * if_s=3;.
 * Note: when the form is forcely closed, the designated variable keeps
 * the string at the moment!
 *
 * [Important note (esp. if you use parallel events)]
 * - Event command interpreter will not exceed until ending the form inputting.
 * - If you checking the variable by parallel event, make sure that there's
 * slight time rug from input ending by next event command execution.
 * (Comment by Sasuke: To run 'Wait 1 frame' after the input is
 * one of the good way to confirm the valuer of variable.)
 *
 * [Advanced option 2 : custom the OK button's position]
 * For example, add btn_x=100;btn_y=100; to the option,
 * you can change the OK buttion. default position is (0, 72).
 * Note that the position is the relative one from the text box.
 *
 * [Advanced option 3 : display Cancel button]
 * You can display not only OK button but also Cancel button by option.
 * When player click 'Cancel', inputted value is simply discarded.
 * You can change the position of cancel button by following notation in
 * the plugin parameters:
 * btn_xc=300;btn_yc=50;
 * This is the relative position from the text box,
 * and the default position is (120, 72).
 *
 * You also can set time limit of input the same as OK button.
 * force_no_sw=6;
 * By adding this option, the input form will be forcely closed
 * and discard the string on the form when the switch #6 become ON .
 *
 * [Parameters additional explanation]
 * 'Force OK Switch ID' and 'Force Cancel Switch ID' are automatically
 * turn OFF when the form is closed. (whreas, switch set in plugin command
 * doesn't change, it's the difference.)
 *
 * [Advanced option 4 : Change the initial value of input form]
 * At default, initial value is designated actor's name like n=5;,
 * or designated game variable's value(only when the value is a string),
 * otherwise it'll be empty string if 'n'(actor) is not designated.
 * You can change the initial value as following options:
 * init=Hiroshi;  Hiroshi
 * init=;  empty string
 * init_n=3; the name of actor whose id is 3.
 * init_v=10;  the value of game variable #10.
 *
 * [Advanced option 5 : custom the limit number window position]
 * When you set max length option (like max=8;), it will display limit number.
 * If you want to change the position, following option is available.
 * rest_x=300;rest_y=100;
 * In this case, the window will move to (300,100).
 * This is the relative position from the text box,
 * and the default position is (288, 72).
 *
 * [Advanced option 6 : custom the width of input form]
 * Width of input form is supposed to defined in CSS file(default: 15em).
 * You can change the width by following option.
 * w=8;
 * In this case, the width become 8em.
 * Note that 1em is equals to the height of each letter,
 * so if use propotional font (defalut), 1em is length of 2 ascii characters.
 * (and at 2 byte character such as Japanese, 1em is the 1 character.)
 *
 * [License]
 * This plugin is public domain. There's no limitation of use.
 *
 */

/*:ja
 * @plugindesc ゲーム画面上にHTMLの入力フォームを表示します
 * @author 神無月サスケ(原案：１１１、くらむぼん)
 *
 * @param OK Button Text
 * @desc 「決定」ボタンに表示する文字列
 * @default 決定
 *
 * @param Display Cancel Button
 * @desc 「キャンセル」ボタンを表示するか。(0=しない, 1=する)
 * @default 1
 *
 * @param Cancel Button Text
 * @desc 「キャンセル」ボタンに表示する文字列
 * @default キャンセル
 *
 * @param Judge Switch Interval
 * @desc 強制終了スイッチの判定ミリ秒間隔です(推奨値100)。
 * 値を減らすと精度が良くなりますが重くなります。
 * @default 100
 *
 * @param Switch ID Selected OK
 * @desc フォームの決定でON、キャンセルでOFFになるスイッチID。
 * 0の時は何も行いません。
 * @default 0
 *
 * @param Force OK Switch ID
 * @desc このIDのスイッチがONになるとフォームを強制決定します。
 * (つまりif_sのデフォルト値)0の時は作動しません。
 * @default 0
 *
 * @param Force Cancel Switch ID
 * @desc このIDのスイッチがONになるとフォームを強制キャンセルします。
 * 0の時は作動しません。
 * @default 0
 *
 * @help
 * HTML5とCSSの機能を使用して画面上に文字入力フォームを表示します。
 * 
 * [最初にすべきこと]
 * このプラグインの実行には、同梱されている「111_InputForm.css」が必要です。
 * index.html のあるフォルダに css フォルダを作成し、そこにこのファイルを
 * 置いてください。
 * このCSSファイルでは入力フォームやボタンのフォームが設定されており、
 * これを書きかえることで自由にスタイルが変更できます。
 * CSSに詳しくない方は「css 書き方」などで検索すればよいでしょう。
 * 
 * [プラグインコマンドと実例]
 * 実行はプラグインコマンド呼び出しで行います。
 * その際パラメータは「パラメータ名=値」の設定をセミコロン(;)で区切った形式で
 * 指定します。間にスペースを挟んではいけません。
 *
 * 例：
 * InputForm x=350;y=200;n=1;max=5;
 *
 * この場合、フォームは座標(350,200)の位置に表示され、
 * 結果はアクター1番の名前に保存されます。
 * 最大文字数は5です。パラメータmaxを省略した時は文字数に制限はなくなります。
 *
 * なお、最大文字数を設定した場合でも、それ以上の文字数が入力可能ですが、
 * フォームが閉じられた時に、最大文字数を超える部分はカットされます。
 * これは下記の追加機能によって強制終了した場合でも同じです。
 *
 * x=350; や y=200; を省略した時は、画面サイズに合わせてセンタリングされます。
 * 例外として、メッセージウィンドウが中央に表示されている場合は、
 * y座標はメッセージウィンドウの下になります。
 *
 * 結果の文字列は、ゲーム変数に格納することも可能ですが、推奨されません。
 * v=11;
 * 上記のオプションを付加すると11番の変数に文字列が格納されますが、
 * ゲーム変数への文字列の格納は本来想定されていないため、結果は確証されません。
 * 
 * なお、変数はIDのみならず変数名での指定も有効です。
 * v=卓郎生存;
 * この場合、「卓郎生存」という名の変数名のうち一番若い変数IDになります。
 * (注意：半角スペースを含んだ変数名はこの方法では指定できません)
 *
 * [追加機能1 : スイッチONによる強制入力終了]
 * 入力にタイムリミットを設定することも可能です。
 * オプションに if_s=3; を追加した場合、スイッチ3番がONになった時に
 * 入力フォームが強制的に閉じます。
 * （これを実装するには、並列イベントを別に作成しスイッチを操作する必要あり）
 * force_ok_sw=3; と表記しても同様の効果があります。
 * なお、入力フォームが強制的に閉じた際には、その時入力されていた文字列が
 * 指定した変数に入ります。
 *
 * [注意事項(特に並列イベントを使う場合)]
 * - フォーム入力が終了するまで、次のイベントコマンドには進みません。
 * - もし、フォーム入力変数を並列イベントで参照する場合、
 * 入力と実際に変数に反映されるまでの間に若干のタイムラグがあることに注意。
 * (サスケ注:プラグインコマンド実行直後に変数を参照したい場合、
 * 間に「ウェイト:1フレーム」を入れると確実です。)
 *
 * [追加機能2 : 決定ボタンの位置設定]
 * 例えば、プラグインコマンドのオプションに以下を追加します。
 * btn_x=100;btn_y=100;
 * これで決定ボタンの座標が(100,100)になります。
 * この座標は、テキストボックスからの相対座標で、
 * 指定のない場合(0, 72)になります。
 *
 * [追加機能3 : キャンセルボタンの表示]
 * デフォルトでは「決定」ボタンのみの表示ですが、オプションによって
 * 「キャンセル」を表示することが可能です。
 * 「キャンセル」が選択された際には、変数などにいかなる変更も行いません。
 * なお、キャンセルボタンの位置は、以下のようなオプションで変更可能です。
 * btn_xc=300;btn_yc=50;
 * これはテキストボックスからの相対座標で、
 * 指定のない場合(120, 72)になります。
 *
 * また、決定ボタンと同様、スイッチONによる強制キャンセルも可能です。
 * force_no_sw=6;
 * このオプションを追加すると、6番のスイッチがONになった際に
 * 強制キャンセルされます。
 * 
 * [パラメータに関する追記事項]
 * 'Force OK Switch ID' と 'Force Cancel Switch ID' は、フォームを閉じた際、
 * 自動的にOFFになります。(プラグインオプションのスイッチはそうなりません)
 *
 * [追加機能4 : 入力フォームの初期文字列の変更]
 * デフォルトでは、n=5;などが指定された場合、そのアクターの名前が、
 * v=11;などが指定され、その変数に文字列が格納されている場合その値が、
 * それ以外の場合は空文字が初期文字列になります。
 * 以下のオプションで、代入対象に関係なく初期文字列を設定可能です。
 * init=ひろし; とすると、初期文字列は「ひろし」になります。
 * init=; のように、空文字の設定も可能です。
 * init_n=3; とすると、3番のアクターの名前が初期文字列になります。
 * init_v=10; とすると、変数10番の値が初期文字列になります。
 *
 * [追加機能5 : 入力可能文字数の位置設定]
 * max=8; のように最大文字数を設定した場合、入力可能文字数が表示されますが、
 * この位置を以下のオプションで変更可能です。
 * rest_x=300;rest_y=100;
 * これで(300,100)に入力可能文字数が表示されるようになります。
 * この座標は、テキストボックスからの相対座標で、
 * 指定のない場合(288, 72)になります。
 *
 * [追加機能6 : 入力フォームの幅の設定]
 * 入力フォームの幅は、CSSファイルにて設定されています(初期値：15em)。
 * このサイズを以下のオプションによって変更可能です。
 * w=8;
 * この場合、入力フォームの幅は8emになります。
 * なお、1emは1文字の高さに相当し、プロポーショナルフォントを使用する限りは、
 * wで指定した値が、表示可能な日本語文字数の長さと等しくなります。
 *
 * [著作権表記]
 * このプラグインは、１１１様、くらむぼん様の 111_InputForm.js をベースに、
 * 神無月サスケが大規模な加筆修正を行ったものです。お二方に感謝します。
 * 
 * このプラグインはパブリックドメインです。利用にいかなる制限もありません。
 */

(function() {
  //
  // for iOS, stop propagation (in order to prevent error)
  //
  var stopPropagation = function (e) {
    e.stopPropagation();
  };

  //
  // Import CSS at first.
  // (css追加)
  //
  (function(){
    var css = document.createElement('link');
    css.rel = "stylesheet";
    css.type = 'text/css';
    css.href = './css/111_InputForm.css';
    // hack
    // var b_top = document.getElementsByTagName('head')[0];
    // b_top.appendChild(css);
  })();

  //
  // Invalidate input function on MV script layer
  // (キー入力不可にする為に)
  //
  Input.formMode = false;
  var _Input_onKeyDown = Input._onKeyDown;
  Input._onKeyDown = function (event) {
    if (Input.formMode) {
      return;
    }
    _Input_onKeyDown.call(this, event);
  };
  var _Input_onKeyUp = Input._onKeyUp;
  Input._onKeyUp = function (event) {
    if(Input.formMode) {
      return;
    }
    _Input_onKeyUp.call(this, event);
  };

  //
  // Interpreter waits until form input is terminated.
  // (入力終わるまで次のイベントコマンド読み込まない)
  //
  var _Game_Interpreter_updateWaitMode =
   Game_Interpreter.prototype.updateWaitMode;    
  Game_Interpreter.prototype.updateWaitMode = function () {
    if(this._waitMode == 'input_form') {
      return true;
    }
    return _Game_Interpreter_updateWaitMode.call(this);
  }

  //
  // when input form opens while message window is open, not close it.
  // (メッセージウィンドウの表示の次に呼び出された場合、
  // メッセージウィンドウを消さないまま入力する)
  //
  var _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
  Game_Interpreter.prototype.command101 = function() {
    _Game_Interpreter_command101.call(this);
    var command = this._list[this._index];
    // if the next command is Plugin Command "InputForm"
    if (command && command.code === 356) {
      if ((/^InputForm /).test(this._list[this._index].parameters[0])) {
        this.command356();
      }
    }
    return false;
  };
  var _Window_Message_doesContinue = Window_Message.prototype.doesContinue;
  Window_Message.prototype.doesContinue = function() {
    return Input.formMode || _Window_Message_doesContinue.call(this);
  };

  //
  // Routine for HTML
  // hack
  // HTMLElement.prototype.positionAdjust = function(screenPos, targetPos) {
  //   // read CSS properties
  //   if (this.defaultFontSize == null) {
  //     var _elem = document.getElementById(this.id);
  //     if (_elem.currentStyle) { // for IE and so on.
  //       _elem = _elem.currentStyle;
  //     } else { // for Chrome, Safari, Opera, and so on.
  //       _elem = window.getComputedStyle(_elem, null);
  //     }
  //     this.defaultFontSize = parseInt(_elem['font-size']) || 24;
  //   }
  //   // set width by scale
  //   var scale = Graphics._realScale;
  //   this.style.left = Math.floor(screenPos['x'] + targetPos['x'] * scale) +
  //    'px';
  //   this.style.top  = Math.floor(screenPos['y'] + targetPos['y'] * scale) +
  //    'px';
  //   this.style['font-size'] = Math.floor(this.defaultFontSize * scale) + 'px';
  // };

  //=========================================================================
  // process parameters (and related functions)
  //=========================================================================
  var parameters = PluginManager.parameters('111_InputForm');
  var textOkButton = parameters['OK Button Text'] || 'OK';
  var textCancelButton = parameters['Cancel Button Text'] || 'Cancel';
  var doDisplayCancel = !!Number(parameters['Display Cancel Button']);
  var judgeInterval = Number(parameters['Judge Switch Interval'] || 100);
  var switchIdOkPressed = Number(parameters['Switch ID Selected OK'] || 0);
  var switchIdForceOk = Number(parameters['Force OK Switch ID'] || 0);
  var switchIdForceCancel = Number(parameters['Force Cancel Switch ID'] || 0);

  //
  // analyze variable parameter notation
  //
  var getVariableIdWhoseNameIs = function (name) {
    var varNames = $dataSystem.variables;
    for (var i = 1; i < varNames.length; i++) {
      if (varNames[i] === name) {
        return i;
      }
    }
    return 0;
  };
  var getVariableIdFromParam = function (varIdNotation) {
    var reg;
    varIdNotation = String(varIdNotation);
    if (reg = (/^(V?)([0-9]+)/i).exec(varIdNotation)) {
      return reg[1] ? $gameVariables.value(+reg[2]) : +reg[2];
    } else {
      return getVariableIdWhoseNameIs(varIdNotation);
    }
  };

  //
  // determine initial string of input form
  //
  var _defaultInputString = function (text, actorId, varId) {
    if (text != null) {
      return text;
    } else if (actorId && $gameActors.actor(actorId)) {
      return $gameActors.actor(actorId).name();
    } else if (varId && ($gameVariables.value(varId) instanceof String)) {
      return $gameVariables.value(varId);
    }
    return '';
  };
  var defaultInputString = function (params) {
    var text = params['init'];
    var actorId = params['init_n'] || params['n'];
    var varId = params['init_v'];
    return _defaultInputString(text, actorId, varId);
  };

  //
  // routine for the case that string length is limited
  //
  var _strLengthText = function (current, max) {
    return String(current) + '/' + max;
  };
  var _setStringColorByLength = function (target, current, max) {
    target.style.color = current > max ? 'red' : 'white';
  };
  var truncateString = function(text, max) {
    return max ? text.substring(0, max) : text;
  };
  var setLimitedStrLength = function (target, current, max) {
    target.textContent = _strLengthText(current, max);
    _setStringColorByLength(target, current, max);
  };

  //
  // centering the input form
  //
  var defaultTargetX = function (target) {
    var rect = target.getBoundingClientRect();
    var width = rect.width + window.pageXOffset;
    return Math.floor((Graphics.boxWidth - width) / 2);
  };
  var defaultTargetY = function (target) {
    // when message window is displaying at the center,
    // change position to below the message window.
    var msgWnd = SceneManager._scene._messageWindow;
    if (msgWnd.isOpen() && msgWnd._positionType === 1) {
      return msgWnd.y + msgWnd.height + msgWnd.standardPadding() * 2;
    }
    var rect = target.getBoundingClientRect();
    var height = rect.height + window.pageYOffset;
    return Math.floor((Graphics.boxHeight - height) / 2);
  };

  //
  // resize the width of input form
  //
  var setFormWidth = function (maxTextLength, target) {
    target.style.cssText += " width: " + maxTextLength + 'em';
  };

  //
  // parse parameters
  //
  var numericParamNames = ['x', 'y', 'max', 'if_s', 'btn_x', 'btn_y',
    'btn_xc', 'btn_yc', 'n', 'force_ok_sw', 'force_no_sw', 'init_n',
    'rest_x', 'rest_y', 'w'];
  var stringParamNames = ['init'];
  var processParameters = function (paramText) {
    var params = {};
    // set default value set in plugin parameter
    params['btn_x'] = 0;
    params['btn_y'] = 72;
    params['btn_xc'] = 120;
    params['btn_yc'] = 72;
    params['rest_x'] = 288;
    params['rest_y'] = 72;
    if (switchIdForceOk) {
      params['force_ok_sw'] = switchIdForceOk;
    }
    if (switchIdForceCancel) {
      params['force_no_sw'] = switchIdForceCancel;
    }
    // parse argument of plugin command
    paramText.split(';').forEach(function (param) {
      if (reg = (/^(\w+)=(\S*)$/i).exec(param)) {
        var key = reg[1].toLowerCase();
        if (key === 'v' || key === 'init_v') {
          params[key] = getVariableIdFromParam(reg[2]);
        } else if (numericParamNames.contains(key)) {
          params[key] = Number(reg[2]);
        } else if (stringParamNames.contains(key)) {
          params[key] = reg[2];
        }
      }
    });
    return params;
  };

  //=========================================================================
  // Game_Interpreter - register plugin command
  //=========================================================================
  var _Game_Interpreter_pluginCommand =
   Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'InputForm'){
      var params = processParameters(args[0]);
      var targetX = params['x'] || null;
      var targetY = params['y'] || null;
      var varId = params['v'] || 0;
      var actorId = params['n'] || 0;
      var maxCount = params['max'] || null;
      var ifSwitchId = params['if_s'] || params['force_ok_sw'] || 0;
      var rejectSwitchId = params['force_no_sw'] || 0;
      var buttonX = params['btn_x'];
      var buttonY = params['btn_y'];
      var cancelButtonX = params['btn_xc'];
      var cancelButtonY = params['btn_yc'];
      var strLengthX = params['rest_x'];
      var strLengthY = params['rest_y'];
      var formWidth = params['w'] || null;

      var interpreter = this;
      var gui = {
        input: null,
        submit: null,
        cancel: null,
        stringLength: null,
        is_pc: true,
        init: function () {
          this.is_pc = Utils.isNwjs();
          this.create();
          this.input.focus();
          this.screenAdjust();
        },
        create: function () {
          // Input form (入力フォーム)
          this.input = document.createElement('input');
          this.input.setAttribute('id', '_111_input');
          // following limitation is inconvinient when Japanese uses IME.
          // (以下は、IME入力の際、必要な変換が出来ない場合があるため削除)
          // if (maxCount) {
          //   this.input.setAttribute('maxlength', maxCount);
          // }
          this.input.value = defaultInputString(params);
          document.body.appendChild(this.input);
          if (formWidth) {
            setFormWidth(formWidth, this.input);
          }
          targetX = targetX || defaultTargetX(this.input);
          targetY = targetY || defaultTargetY(this.input);
          // Submit Button (送信ボタン)
          this.submit = document.createElement('input');
          this.submit.setAttribute('type', 'submit');
          this.submit.setAttribute('id', '_111_submit');
          this.submit.setAttribute('value', textOkButton);
          document.body.appendChild(this.submit);
          // Cancel Button (キャンセルボタン)
          if (doDisplayCancel) {
            this.cancel = document.createElement('input');
            this.cancel.setAttribute('type', 'submit');
            this.cancel.setAttribute('id', '_111_submit');
            this.cancel.setAttribute('value', textCancelButton);
            document.body.appendChild(this.cancel);
          }
          // Display string length of current/max (入力/最大文字数表示)
          if (maxCount) {
            this.strLength = document.createElement('span');
            this.strLength.setAttribute('id', '_Sasuke_RestStrLength');
            setLimitedStrLength(this.strLength, this.input.value.length,
             maxCount);
            document.body.appendChild(this.strLength);
          }
        },
        accept: function () {
          this.input.value = truncateString(this.input.value, maxCount);
          if (varId) {
            $gameVariables.setValue(varId, this.input.value);
          }
          if (actorId && $gameActors.actor(actorId)) {
            $gameActors.actor(actorId).setName(this.input.value);
          }
          if (switchIdOkPressed) {
            $gameSwitches.setValue(switchIdOkPressed, true);
          }
          this.end();
        },
        reject: function () {
          if (switchIdOkPressed) {
            $gameSwitches.setValue(switchIdOkPressed, false);
          }
          this.end();
        },
        start: function () {
          interpreter.setWaitMode('input_form');
          Input.clear();
          Input.formMode = true;
        },
        end: function () {
          this.input.remove();
          this.submit.remove();
          if (this.cancel) {
            this.cancel.remove();
          }
          if (this.strLength) {
            this.strLength.remove();
          }
          window.removeEventListener("resize", resizeEvent, false);
          interpreter.setWaitMode('');
          Input.formMode = false;
          clearInterval(_eventId);
        },
        screenAdjust: function () { // canvasの左上を基準にした位置に合わせる
          var _canvas = document.querySelector('#UpperCanvas');
          var rect = _canvas.getBoundingClientRect();
          var screenX = rect.left;
          var screenY = rect.top;
          this.input.positionAdjust({x:screenX, y:screenY},
           {x:targetX, y:targetY});
          this.submit.positionAdjust({x:screenX, y:screenY},
           {x:targetX + buttonX, y:targetY + buttonY});
          if (this.cancel) {
            this.cancel.positionAdjust({x:screenX, y:screenY},
             {x:targetX + cancelButtonX, y:targetY + cancelButtonY});
          }
          if (this.strLength) {
            this.strLength.positionAdjust({x:screenX, y:screenY},
             {x:targetX + strLengthX, y:targetY + strLengthY});
          }
        }
      }
      // ----------------------------------------
      gui.init();
      gui.input.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) { // 決定キーで送信
          Input.clear();
          gui.accept();
          // stop propagation not to fire keydown event in document.
          // (親へのイベント伝播を止める(documentのkeydownが反応しないように))
          e.stopPropagation();
        }
      });
      // ----------------------------------------
      //
      // To prevent iOS environment, stop several propagations
      //

      // To prevent click bomb on other game screen
      //  (裏のゲーム画面のクリック暴発を防ぐ)
      gui.input.addEventListener("mousedown", stopPropagation);
      gui.submit.addEventListener("mousedown", stopPropagation);
      if (gui.cancel) {
        gui.cancel.addEventListener("mousedown", stopPropagation);
      }
      // To be sure to catch the event on iOS
      // （iOSでclickイベント取れない対策）
      gui.input.addEventListener("touchstart", stopPropagation);
      gui.submit.addEventListener("touchstart", stopPropagation);
      if (gui.cancel) {
        gui.cancel.addEventListener("touchstart", stopPropagation);
      }

      // ----------------------------------------
      // OK button clicked (送信ボタンクリック)
      gui.submit.addEventListener("click", function () {
        gui.accept();
        return false;
      });
      if (gui.cancel) {
        gui.cancel.addEventListener("click", function () {
          gui.reject();
          return false;
        });
      }
      if (gui.strLength) {
        gui.input.addEventListener("keyup", function () {
          setLimitedStrLength(gui.strLength, gui.input.value.length, maxCount);
          return false;
        });
      }
      // Event for forcing termination by switch condition
      // (スイッチによって強制終了するイベント)
      if (ifSwitchId || rejectSwitchId) {
        var _eventId = setInterval(function () {
          if ($gameSwitches.value(rejectSwitchId)) {
            if (switchIdForceCancel) {
              $gameSwitches.setValue(switchIdForceCancel, false);
            }
            gui.reject();
          } else if ($gameSwitches.value(ifSwitchId)) {
            if (switchIdForceOk) {
              $gameSwitches.setValue(switchIdForceOk, false);
            }
            gui.accept();
          }
        }, judgeInterval);
      }
      // At some condition, it needs to change ratio(%) of elements' size
      // everytime when browser's size changes.
      // (ブラウザではウィンドウのサイズが変わる度に%求め直すイベントが必要)
      //if(! gui.is_pc){
        var resizeEvent = gui.screenAdjust.bind(gui);
        window.addEventListener("resize", resizeEvent, false);
      //}
      //
      gui.start();
    }
  };
})();