//=============================================================================
// main.js
//=============================================================================
document.createElement('div')

PluginManager.setup($plugins);

const font = new FontFace('GameFont', 'url(../public/fonts/JF-Dot-Ayu20.ttf)');
font.load();

window.onload = function() {
    SceneManager.run(Scene_Boot);
};
