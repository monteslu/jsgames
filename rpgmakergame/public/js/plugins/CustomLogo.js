//=============================================================================
// RPG Maker MZ - CustomLogo
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Shows RPG Maker and user logos at the start of the game.
 * @author nz_prism
 *
 * @help CustomLogo.js
 * ver. 1.0.0
 * 
 * [History]
 * 05/12/2023 1.0.0 Released
 * 
 * This plugin shows RPG Maker logo and other images at the start of the game,
 * such as user logos or notes. It can show up to 3 logos in turns. Logo
 * settings including image file and showing times can be configured through
 * plugin parameters.
 * Setting the plugin parameter "Logo n Skippable" to true enables players to
 * skip the logo by pressing OK or cancel button. Plus, setting the plugin
 * parameter "Allow Total Skip" to true enables players to skip all the logos
 * just by single button pressing. If there are any logos which aren't
 * skippable, it will proceed to the timing before the logo appears.
 * 
 * Note the default image for Logo 1 is an RPG Maker logo. Although you can
 * replace it with any image, you are recommended to use it to display your
 * game is made with RPG Maker.
 *
 * @param logo1
 * @text Logo 1 Settings
 * @desc The settings for the first logo.
 * 
 * @param logo1ImageName
 * @text Logo 1 Image Name
 * @desc The image file name for the first logo. If no image is specified, the next logo will be shown.
 * @parent logo1
 * @type file
 * @dir img/system
 * 
 * @param logo1Skippable
 * @text Logo 1 Skippable
 * @desc If true, players can skip the first logo.
 * @parent logo1
 * @type boolean
 * @default true
 * 
 * @param logo1Coordinate
 * @text Logo 1 Coordinate
 * @desc The coordinate settings for the first logo.
 * @parent logo1
 * 
 * @param logo1X
 * @text Logo 1 X
 * @desc The x for the first logo.
 * @parent logo1Coordinate
 * @type number
 * @default 408
 * 
 * @param logo1Y
 * @text Logo 1 Y
 * @desc The y for the first logo.
 * @parent logo1Coordinate
 * @type number
 * @default 312
 * 
 * @param logo1Origin
 * @text Logo 1 Origin
 * @desc THe origin for the first logo.
 * @parent logo1Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo1Time
 * @text Logo 1 Times
 * @desc The time settings for the first logo.
 * @parent logo1
 * 
 * @param logo1FadeinFrames
 * @text Logo 1 Fade-in Time
 * @desc The frames for the first logo to fade in.
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1FadeoutFrames
 * @text Logo 1 Fade-out Time
 * @desc The frames for the first logo to fade out.
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1DurationFrames
 * @text Logo 1 Shown Time
 * @desc The frames for the first logo to be shown.
 * @parent logo1Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo2
 * @text Logo 2 Settings
 * @desc The settings for the second logo.
 * 
 * @param logo2ImageName
 * @text Logo 2 Image Name
 * @desc The image file name for the second logo. If no image is specified, the next logo will be shown.
 * @parent logo2
 * @type file
 * @dir img/system
 * 
 * @param logo2Skippable
 * @text Logo 2 Skippable
 * @desc If true, players can skip the second logo.
 * @parent logo2
 * @type boolean
 * @default true
 * 
 * @param logo2Coordinate
 * @text Logo 2 Coordinate
 * @desc The coordinate settings for the second logo.
 * @parent logo2
 * 
 * @param logo2X
 * @text Logo 2 X
 * @desc The x for the second logo.
 * @parent logo2Coordinate
 * @type number
 * @default 408
 * 
 * @param logo2Y
 * @text Logo 2 Y
 * @desc The y for the second logo.
 * @parent logo2Coordinate
 * @type number
 * @default 312
 * 
 * @param logo2Origin
 * @text Logo 2 Origin
 * @desc THe origin for the second logo.
 * @parent logo2Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo2Time
 * @text Logo 2 Times
 * @desc The time settings for the second logo.
 * @parent logo2
 * 
 * @param logo2FadeinFrames
 * @text Logo 2 Fade-in Time
 * @desc The frames for the second logo to fade in.
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2FadeoutFrames
 * @text Logo 2 Fade-out Time
 * @desc The frames for the second logo to fade out.
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2DurationFrames
 * @text Logo 2 Shown Time
 * @desc The frames for the second logo to be shown.
 * @parent logo2Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo3
 * @text Logo 3 Settings
 * @desc The settings for the third logo.
 * 
 * @param logo3ImageName
 * @text Logo 3 Image Name
 * @desc The image file name for the third logo. If no image is specified, it will proceed to the title scene.
 * @parent logo3
 * @type file
 * @dir img/system
 * 
 * @param logo3Skippable
 * @text Logo 3 Skippable
 * @desc If true, players can skip the third logo.
 * @parent logo3
 * @type boolean
 * @default true
 * 
 * @param logo3Coordinate
 * @text Logo 3 Coordinate
 * @desc The coordinate settings for the third logo.
 * @parent logo3
 * 
 * @param logo3X
 * @text Logo 3 X
 * @desc The x for the third logo.
 * @parent logo3Coordinate
 * @type number
 * @default 408
 * 
 * @param logo3Y
 * @text Logo 3 Y
 * @desc The y for the third logo.
 * @parent logo3Coordinate
 * @type number
 * @default 312
 * 
 * @param logo3Origin
 * @text Logo 3 Origin
 * @desc THe origin for the third logo.
 * @parent logo3Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo3Time
 * @text Logo 3 Times
 * @desc The time settings for the third logo.
 * @parent logo3
 * 
 * @param logo3FadeinFrames
 * @text Logo 3 Fade-in Time
 * @desc The frames for the third logo to fade in.
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3FadeoutFrames
 * @text Logo 3 Fade-out Time
 * @desc The frames for the third logo to fade out.
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3DurationFrames
 * @text Logo 3 Shown Time
 * @desc The frames for the third logo to be shown.
 * @parent logo3Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param allowTotalSkip
 * @text Allow Total Skip
 * @desc If true, players can skip all the logos just by single button pressing.
 * @type boolean
 * @default true
 * 
 */

/*:ja
 * @target MV MZ
 * @plugindesc ゲーム起動時にRPG Makerおよびユーザーロゴを表示します。
 * @author nz_prism
 *
 * @help CustomLogo.js
 * ver. 1.0.0
 * 
 * [バージョン履歴]
 * 2023/05/12 1.0.0 リリース
 * 
 * RPG Makerロゴおよび各種ユーザーロゴや注意書きなどをゲーム起動時に表示するプ
 * ラグインです。最大3つまでのロゴを順番に表示できます。表示画像や表示時間はプ
 * ラグインパラメータにより細かく設定することが可能です。
 * プラグインパラメータ「ロゴnスキップ可能」をオンに設定すると、決定ボタンや
 * キャンセルボタンの押下によるそのロゴのスキップが可能になります。また、プラグ
 * インパラメータ「全スキップを許可」をオンにすると、一回のボタン押下により全て
 * のロゴがスキップされるようになります。スキップ不可のロゴが存在する場合、その
 * ロゴの前までのロゴがスキップされます。
 * 
 * なおロゴ1の画像としてデフォルトで設定されている画像はRPG Makerのロゴです。
 * 本ロゴについては、RPGMaker製ゲームであることを明示するために表示を推奨して
 * おります。
 *
 * @param logo1
 * @text ロゴ1設定
 * @desc 最初に表示するロゴの設定です。
 * 
 * @param logo1ImageName
 * @text ロゴ1画像名
 * @desc 最初に表示するロゴの画像ファイル名です。未設定の場合、次のロゴが表示されます。
 * @parent logo1
 * @type file
 * @dir img/system
 * 
 * @param logo1Skippable
 * @text ロゴ1スキップ可能
 * @desc オンにすると最初に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo1
 * @type boolean
 * @default true
 * 
 * @param logo1Coordinate
 * @text ロゴ1座標
 * @desc 最初に表示するロゴの座標設定です。
 * @parent logo1
 * 
 * @param logo1X
 * @text ロゴ1X座標
 * @desc 最初に表示するロゴのX座標です。
 * @parent logo1Coordinate
 * @type number
 * @default 408
 * 
 * @param logo1Y
 * @text ロゴ1Y座標
 * @desc 最初に表示するロゴのY座標です。
 * @parent logo1Coordinate
 * @type number
 * @default 312
 * 
 * @param logo1Origin
 * @text ロゴ1原点
 * @desc 最初に表示するロゴの座標原点です。
 * @parent logo1Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo1Time
 * @text ロゴ1表示時間
 * @desc 最初に表示するロゴの表示時間設定です。
 * @parent logo1
 * 
 * @param logo1FadeinFrames
 * @text ロゴ1フェードイン時間
 * @desc 最初に表示するロゴのフェードインフレーム数です。
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1FadeoutFrames
 * @text ロゴ1フェードアウト時間
 * @desc 最初に表示するロゴのフェードアウトフレーム数です。
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1DurationFrames
 * @text ロゴ1表示時間
 * @desc 最初に表示するロゴの表示フレーム数です。
 * @parent logo1Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo2
 * @text ロゴ2設定
 * @desc 2番目に表示するロゴの設定です。
 * 
 * @param logo2ImageName
 * @text ロゴ2画像名
 * @desc 2番目に表示するロゴの画像ファイル名です。未設定の場合、次のロゴが表示されます。
 * @parent logo2
 * @type file
 * @dir img/system
 * 
 * @param logo2Skippable
 * @text ロゴ2スキップ可能
 * @desc オンにすると2番目に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo2
 * @type boolean
 * @default true
 * 
 * @param logo2Coordinate
 * @text ロゴ2座標
 * @desc 2番目に表示するロゴの座標設定です。
 * @parent logo2
 * 
 * @param logo2X
 * @text ロゴ2X座標
 * @desc 2番目に表示するロゴのX座標です。
 * @parent logo2Coordinate
 * @type number
 * @default 408
 * 
 * @param logo2Y
 * @text ロゴ2Y座標
 * @desc 2番目に表示するロゴのY座標です。
 * @parent logo2Coordinate
 * @type number
 * @default 312
 * 
 * @param logo2Origin
 * @text ロゴ2原点
 * @desc 2番目に表示するロゴの座標原点です。
 * @parent logo2Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo2Time
 * @text ロゴ2表示時間
 * @desc 2番目に表示するロゴの表示時間設定です。
 * @parent logo2
 * 
 * @param logo2FadeinFrames
 * @text ロゴ2フェードイン時間
 * @desc 2番目に表示するロゴのフェードインフレーム数です。
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2FadeoutFrames
 * @text ロゴ2フェードアウト時間
 * @desc 2番目に表示するロゴのフェードアウトフレーム数です。
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2DurationFrames
 * @text ロゴ2表示時間
 * @desc 2番目に表示するロゴの表示フレーム数です。
 * @parent logo2Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo3
 * @text ロゴ3設定
 * @desc 3番目に表示するロゴの設定です。
 * 
 * @param logo3ImageName
 * @text ロゴ3画像名
 * @desc 3番目に表示するロゴの画像ファイル名です。未設定の場合、タイトル画面に移行します。
 * @parent logo3
 * @type file
 * @dir img/system
 * 
 * @param logo3Skippable
 * @text ロゴ3スキップ可能
 * @desc オンにすると3番目に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo3
 * @type boolean
 * @default true
 * 
 * @param logo3Coordinate
 * @text ロゴ3座標
 * @desc 3番目に表示するロゴの座標設定です。
 * @parent logo3
 * 
 * @param logo3X
 * @text ロゴ3X座標
 * @desc 3番目に表示するロゴのX座標です。
 * @parent logo3Coordinate
 * @type number
 * @default 408
 * 
 * @param logo3Y
 * @text ロゴ3Y座標
 * @desc 3番目に表示するロゴのY座標です。
 * @parent logo3Coordinate
 * @type number
 * @default 312
 * 
 * @param logo3Origin
 * @text ロゴ3原点
 * @desc 3番目に表示するロゴの座標原点です。
 * @parent logo3Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo3Time
 * @text ロゴ3表示時間
 * @desc 3番目に表示するロゴの表示時間設定です。
 * @parent logo3
 * 
 * @param logo3FadeinFrames
 * @text ロゴ3フェードイン時間
 * @desc 3番目に表示するロゴのフェードインフレーム数です。
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3FadeoutFrames
 * @text ロゴ3フェードアウト時間
 * @desc 3番目に表示するロゴのフェードアウトフレーム数です。
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3DurationFrames
 * @text ロゴ3表示時間
 * @desc 3番目に表示するロゴの表示フレーム数です。
 * @parent logo3Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param allowTotalSkip
 * @text 全スキップを許可
 * @desc オンにすると一回のボタン押下によりすべてのロゴがスキップされます（スキップ可能なもののみ）。
 * @type boolean
 * @default true
 * 
 */


(() => {
    'use strict';
    var PLUGIN_NAME = "CustomLogo";
    var pluginParams = PluginManager.parameters(PLUGIN_NAME);

    var LOGO1_IMAGE_NAME = pluginParams.logo1ImageName;
    var LOGO1_SKIPPABLE = pluginParams.logo1Skippable == "true";
    var LOGO1_X = Number(pluginParams.logo1X);
    var LOGO1_Y = Number(pluginParams.logo1Y);
    var LOGO1_ORIGN = Number(pluginParams.logo1Origin);
    var LOGO1_FADEIN_FRAMES = Number(pluginParams.logo1FadeinFrames);
    var LOGO1_FADEOUT_FRAMES = Number(pluginParams.logo1FadeoutFrames);
    var LOGO1_DURATION_FRAMES = Number(pluginParams.logo1DurationFrames);

    var LOGO2_IMAGE_NAME = pluginParams.logo2ImageName;
    var LOGO2_SKIPPABLE = pluginParams.logo2Skippable == "true";
    var LOGO2_X = Number(pluginParams.logo2X);
    var LOGO2_Y = Number(pluginParams.logo2Y);
    var LOGO2_ORIGN = Number(pluginParams.logo2Origin);
    var LOGO2_FADEIN_FRAMES = Number(pluginParams.logo2FadeinFrames);
    var LOGO2_FADEOUT_FRAMES = Number(pluginParams.logo2FadeoutFrames);
    var LOGO2_DURATION_FRAMES = Number(pluginParams.logo2DurationFrames);

    var LOGO3_IMAGE_NAME = pluginParams.logo3ImageName;
    var LOGO3_SKIPPABLE = pluginParams.logo3Skippable == "true";
    var LOGO3_X = Number(pluginParams.logo3X);
    var LOGO3_Y = Number(pluginParams.logo3Y);  
    var LOGO3_ORIGN = Number(pluginParams.logo3Origin);
    var LOGO3_FADEIN_FRAMES = Number(pluginParams.logo3FadeinFrames);
    var LOGO3_FADEOUT_FRAMES = Number(pluginParams.logo3FadeoutFrames);
    var LOGO3_DURATION_FRAMES = Number(pluginParams.logo3DurationFrames);

    var ALLOW_TOTAL_SKIP = pluginParams.allowTotalSkip == "true";


    ImageManager.loadLogoImages = function() {
        this.loadSystem(LOGO1_IMAGE_NAME);
        this.loadSystem(LOGO2_IMAGE_NAME);
        this.loadSystem(LOGO3_IMAGE_NAME);
    };


    var _Scene_Boot_prototype_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_prototype_loadSystemImages.call(this);
        ImageManager.loadLogoImages();
    };

    if (Utils.RPGMAKER_NAME == "MZ") {
        Scene_Boot.prototype.startNormalGame = function() {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Logo);
            Window_TitleCommand.initCommandPosition();
        };
    } else {
        Scene_Boot.prototype.start = function() {
            Scene_Base.prototype.start.call(this);
            SoundManager.preloadImportantSounds();
            if (DataManager.isBattleTest()) {
                DataManager.setupBattleTest();
                SceneManager.goto(Scene_Battle);
            } else if (DataManager.isEventTest()) {
                DataManager.setupEventTest();
                SceneManager.goto(Scene_Map);
            } else {
                this.checkPlayerLocation();
                DataManager.setupNewGame();
                SceneManager.goto(Scene_Logo);
                Window_TitleCommand.initCommandPosition();
            }
            this.updateDocumentTitle();
        };
    }


    function Scene_Logo() {
        this.initialize(...arguments);
    }
    
    Scene_Logo.prototype = Object.create(Scene_Base.prototype);
    Scene_Logo.prototype.constructor = Scene_Logo;
    
    Scene_Logo.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._logoIndex = 0;
        this._phase = 0;
        this._duration = 0;
    };

    Scene_Logo.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createSprites();
    };
    
    Scene_Logo.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
    };
    
    Scene_Logo.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.updateInput();
        this.updatePhase();
    };
    
    Scene_Logo.prototype.updateInput = function() {
        if (
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel") ||
            TouchInput.isTriggered() ||
            TouchInput.isCancelled()
        ) {
            var oldLogoIndex = this._logoIndex;
            switch (this._logoIndex) {
                case 0:
                    if (LOGO1_SKIPPABLE) {
                        this._logoIndex++;
                        this._logo1Sprite.opacity = 0;
                        if (ALLOW_TOTAL_SKIP) {
                            if (LOGO2_SKIPPABLE) {
                                this._logoIndex++;
                                if (LOGO3_SKIPPABLE) {
                                    this._logoIndex++;
                                }
                            }
                        }
                    }
                    break;
                case 1:
                    if (LOGO2_SKIPPABLE) {
                        this._logoIndex++;
                        this._logo2Sprite.opacity = 0;
                        if (ALLOW_TOTAL_SKIP && LOGO3_SKIPPABLE) {
                            this._logoIndex++;
                        }
                    }
                    break;
                case 2:
                    if (LOGO3_SKIPPABLE) this._logoIndex++;
                    break;
            }
            if (this._logoIndex != oldLogoIndex) {
                this._phase = 0;
                this._duration = 0;
            }
        }
    };
    
    Scene_Logo.prototype.increasingOpacityPerFrame = function() {
        switch (this._logoIndex) {
            case 0: return Math.ceil(255 / LOGO1_FADEIN_FRAMES);
            case 1: return Math.ceil(255 / LOGO2_FADEIN_FRAMES);
            case 2: return Math.ceil(255 / LOGO3_FADEIN_FRAMES);
            default: return 22;
        }
    };

    Scene_Logo.prototype.decreasingOpacityPerFrame = function() {
        switch (this._logoIndex) {
            case 0: return Math.ceil(255 / LOGO1_FADEOUT_FRAMES);
            case 1: return Math.ceil(255 / LOGO2_FADEOUT_FRAMES);
            case 2: return Math.ceil(255 / LOGO3_FADEOUT_FRAMES);
            default: return 22;
        }
    };

    Scene_Logo.prototype.updatePhase = function() {
        var sprite;
        var maxDuration;
        switch (this._logoIndex) {
            case 0:
                if (LOGO1_IMAGE_NAME) {
                    sprite = this._logo1Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO1_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO1_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO1_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            case 1:
                if (LOGO2_IMAGE_NAME) {
                    sprite = this._logo2Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO2_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO2_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO2_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            case 2:
                if (LOGO3_IMAGE_NAME) {
                    sprite = this._logo3Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO3_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO3_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO3_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            default:
                SceneManager.goto(Scene_Title);
                return;
        }
        if (this._duration < maxDuration) {
            this._duration++;
            switch (this._phase) {
                case 0:
                    sprite.opacity = Math.min(sprite.opacity + this.increasingOpacityPerFrame(), 255);
                    break;
                case 2:
                    sprite.opacity = Math.max(sprite.opacity - this.decreasingOpacityPerFrame(), 0);
                    break;
            }
        } else {
            this._duration = 0;
            this._phase++;
            if (this._phase == 3) {
                this._phase = 0;
                this._logoIndex++;
            }
        }
    };
    
    Scene_Logo.prototype.isBusy = function() {
        return false;
    };
    
    Scene_Logo.prototype.createSprites = function() {
        var logo1 = new Sprite();
        var logo2 = new Sprite();
        var logo3 = new Sprite();
        logo1.bitmap = ImageManager.loadSystem(LOGO1_IMAGE_NAME);
        logo2.bitmap = ImageManager.loadSystem(LOGO2_IMAGE_NAME);
        logo3.bitmap = ImageManager.loadSystem(LOGO3_IMAGE_NAME);
        logo1.anchor.x = LOGO1_ORIGN;
        logo1.anchor.y = LOGO1_ORIGN;
        logo2.anchor.x = LOGO2_ORIGN;
        logo2.anchor.y = LOGO2_ORIGN;
        logo3.anchor.x = LOGO3_ORIGN;
        logo3.anchor.y = LOGO3_ORIGN;
        logo1.x = LOGO1_X;
        logo1.y = LOGO1_Y;
        logo2.x = LOGO2_X;
        logo2.y = LOGO2_Y;
        logo3.x = LOGO3_X;
        logo3.y = LOGO3_Y;
        this._logo1Sprite = logo1;
        this._logo2Sprite = logo2;
        this._logo3Sprite = logo3;
        logo1.opacity = 0;
        logo2.opacity = 0;
        logo3.opacity = 0;
        this.addChild(logo1);
        this.addChild(logo2);
        this.addChild(logo3);
    };


})();
