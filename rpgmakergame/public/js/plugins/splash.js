var IMAGES = ["DisclaimerLogo", "KaguraLogo", "DevLogo"];

var FADE_IN_TIME  = 60;
var FADE_OUT_TIME = 40;
var WAIT_TIME = 150;

var INIT = false;
var CURRENT_SCREEN = 0;

function Splash_Screen()
{
	this.initialize.apply(this, arguments);
}

globalThis.Splash_Screen = Splash_Screen;

Splash_Screen.prototype = Object.create(Scene_Base.prototype);
Splash_Screen.prototype.constructor = Splash_Screen;


Splash_Screen.prototype.initialize = function()
{
		Scene_Base.prototype.initialize.call(this);
		this.fadeInDone = false;
		this.fadeOutDone = false;
		this.splashImg = null;
		this.waitTime = WAIT_TIME;
		this.done = false;
};

Splash_Screen.prototype.create = function()
{
		Scene_Base.prototype.create.call(this);
		this.createSplashScreen();
};

Splash_Screen.prototype.start = function()
{
		Scene_Base.prototype.start.call(this);
		SceneManager.clearStack();
};

Splash_Screen.prototype.update = function()
{
	if (!this.fadeInDone)
	{
		this.splashImg.opacity = 255;
		this.startFadeIn(FADE_IN_TIME, false);
		this.fadeInDone = true;
	}
	else
	{
		if (this.waitTime > 0 && !this.fadeOutDone)
			this.waitTime--;
		else
		{
			if (!this.fadeOutDone)
			{
				this.startFadeOut(FADE_OUT_TIME, false);
				this.fadeOutDone = true;
			}
		}
	}
	
	if(Input.isTriggered('ok') || TouchInput.isTriggered())
	{
		this.fadeOutDone = true;
	}

	if (this.fadeOutDone && !this.done)
	{
		this.done = true;
		this.showTitle();
	}

	Scene_Base.prototype.update.call(this);
};

Splash_Screen.prototype.createSplashScreen = function()
{
	this.splashImg = new Sprite(ImageManager.loadSystem(IMAGES[CURRENT_SCREEN]));
	this.splashImg.opacity = 0;
	this.centerSprite(this.splashImg);
	this.addChild(this.splashImg);
};

Splash_Screen.prototype.centerSprite = function(sprite)
{
	sprite.x = Graphics.width / 2;
	sprite.y = Graphics.height / 2;
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
};

Splash_Screen.prototype.showTitle = function()
{
	Scene_Base.prototype.start.call(this);

	CURRENT_SCREEN++;
	if(CURRENT_SCREEN < IMAGES.length)
		SceneManager.goto(Splash_Screen);
	else
		SceneManager.goto(Scene_Title);
};

var SceneManager_goto_org = SceneManager.goto;
SceneManager.goto = function(sceneClass)
{
	if(sceneClass === Scene_Title && !INIT)
	{
		INIT = true;
		SceneManager.goto(Splash_Screen);
	}
	else
		SceneManager_goto_org.call(this, sceneClass);
};