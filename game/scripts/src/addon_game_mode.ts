import 'utils/index';
import { ActivateModules } from './modules';
import Precache from './utils/precache';
import { GameMode } from './GameMode';

Object.assign(getfenv(), {
    Activate: () => {
        ActivateModules();
        GameMode.Activate();
    },
    Precache: Precache,
});

//重载地图
if (GameRules.Addon) {
    GameRules.Addon.Reload();
}
