import { reloadable } from './utils/tstl-utils';
import { sys_init } from './my_game/SysInit';
// import { modifier_panic } from './modifiers/modifier_panic';

const heroSelectionTime = 20;

declare global {
    var MyGame: GameMode;
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

type TName = keyof GameEventDeclarations;

@reloadable
export class GameMode {
    private SysManger: sys_init;
    private GameEventListenerIDs: EventListenerID[] = [];
    private heartbeatRate = 0.1; //心跳频率
    public Game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
    public RestartGame = false; //是否重载游戏
    //激活游戏
    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
        MyGame = GameRules.Addon;
        MyGame.SysManger = new sys_init();
        MyGame.SysInit();
    }

    constructor() {
        this.event('game_rules_state_change', () => this.OnStateChange());
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();
        //选人阶段进行
        if (state === GameState.HERO_SELECTION) {
            Event.send('玩家-选人阶段');
            print('选人阶段');
        }
        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    //官方事件注册
    public event(eventName: TName, func, context?: Object): EventListenerID {
        const id = ListenToGameEvent(eventName, func, context);
        this.GameEventListenerIDs.push(id);
        return id;
    }

    //移除官方事件
    public eventRemove(id: EventListenerID) {
        StopListeningToGameEvent(id);
        this.GameEventListenerIDs.splice(this.GameEventListenerIDs.indexOf(id), 1);
    }

    //事件清理
    private clearEventListenerIDs() {
        this.GameEventListenerIDs.forEach(EventId => {
            StopListeningToGameEvent(EventId);
        });
        this.GameEventListenerIDs = [];
    }

    //安装组件
    public SysInit() {
        this.SysManger.Creation();
    }

    //游戏开始
    private StartGame(): void {
        Event.send('游戏-开始');
        Timers.CreateTimer(this.heartbeatRate, () => {
            Event.send('游戏-心跳', this.heartbeatRate);
            return this.heartbeatRate;
        });
    }

    //重开游戏
    public Reload() {
        print('重载游戏');
        this.SysManger.Destruction(); //卸载组件
        this.SysInit(); //重新安装组件
        if (!this.RestartGame) return;
        this.clearEventListenerIDs(); //清理所有事件
        // Do some stuff here
    }
}
