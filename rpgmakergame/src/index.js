
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


function evalScript(filename) {
    // Get current file directory in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Read the plugin file content
    const pluginPath = join(__dirname, filename);
    const pluginContent = readFileSync(pluginPath, 'utf8');
    
    // Inject and execute the plugin content
    eval(pluginContent);
};

const __filename = fileURLToPath(import.meta.url);
globalThis.__projectDirname = dirname(__filename);

globalThis.document.body.style = {}
globalThis.document.head = {
    style : {}
}

globalThis.document.getElementsByTagName = () => {return []}
globalThis.document.body.getElementsByTagName = () => {return []}


const originalDocumentCreateElement = globalThis.document.createElement;
globalThis.document.createElement = (name, ...args) => {
    if (name === 'div') {
        return {
            appendChild: () => {},
            style : {}
        }
    } else if(name === 'video'){
            const v = new globalThis.Video();
            v.style = {}
            return v;
    } else {
        return originalDocumentCreateElement(name, ...args);
    }
};

globalThis.location = {
    search: '',
    href: '',
    pathname: '',
    hostname: '',
    protocol: '',
};

globalThis.document.fonts.ready = Promise.resolve()

globalThis.Image.prototype._eventListeners = new Map();

globalThis.Image.prototype.addEventListener = function(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(callback);
    const originalOnload = this.onload;

    if (event === 'load') {
        this.onload = function() {
            if (originalOnload) {
                originalOnload.call(this);
            }
            callback.call(this);
        }
    }
  }

globalThis.Image.prototype.removeEventListener = function(event, callback) {
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  globalThis.Image.prototype.dispatchEvent = function(event, data) {
    console.log("_dispatchEvent", event)
    if (this._eventListeners.has(event)) {
      for (const callback of this._eventListeners.get(event)) {
        callback.call(this, data);
      }
    }
  }

evalScript('../public/js/libs/pixi.js');
evalScript('../public/js/libs/pixi-tilemap.js');
evalScript('../public/js/libs/pixi-picture.js');
evalScript('../public/js/libs/fpsmeter.js');
evalScript('../public/js/libs/lz-string.js');
evalScript('../public/js/libs/iphone-inline-video.browser.js');
evalScript('../public/js/rpg_core.js');
evalScript('../public/js/rpg_managers.js');
evalScript('../public/js/rpg_objects.js');
evalScript('../public/js/rpg_scenes.js');
evalScript('../public/js/rpg_sprites.js');
evalScript('../public/js/rpg_windows.js');
evalScript('../public/js/plugins.js');
evalScript('../public/js/main.js');

