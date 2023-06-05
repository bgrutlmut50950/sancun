import { reloadable } from '../../utils/tstl-utils';
declare global {
    var _InDebug: boolean;
    interface CustomNetTableDeclarations {
        test_table: {
            test_key: { data_1?: number; data_2?: string };
            test_key2: { data_1?: number; data_2?: string };
        };
    }
}
type keys = keyof CustomNetTableDeclarations;
//变化镜头距离
function changeCameraDistance(dis: number, time: number) {
    let i = 0;
    Timers.CreateTimer(0.01, () => {
        const game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
        const distance = game.GetCameraDistanceOverride();
        game.SetCameraDistanceOverride(distance + (dis * 0.01) / time); // 设置镜头距离
        i = i + 0.01;
        if (i > time) {
            return;
        }
        return 0.01;
    });
}

@reloadable
export class Debug {
    private gridnav_show: boolean = false; //记录地形显示
    private GameEvents: EventListenerID[] = [];
    //功能函数
    public callTable = {
        //提高镜头
        ['+']: function () {
            changeCameraDistance(300, 0.5);
        },
        //降低镜头
        ['-']: function () {
            changeCameraDistance(-300, 0.5);
        },
        //局内重启
        ['s1']: function () {},

        //重载脚本
        ['s']: function () {
            SendToConsole('script_reload');
        },
        //重启游戏
        ['r']: function () {
            SendToConsole('restart');
        },
        //显示地形网格
        ['c']: function () {
            this.gridnav_show = !this.gridnav_show;
            if (this.gridnav_show) {
                SendToConsole('cl_dota_gridnav_show 1');
                SendToConsole('cl_dota_gridnav_show_size 300');
            } else {
                SendToConsole('cl_dota_gridnav_show 0');
            }
        },
        //清除控制台
        ['cl']: function () {
            SendToConsole('clear');
        },
        ['test']: function (keys) {
            // 使用GameUI的例子，首先你需要定义一个player对象和一个Vector对象
            let player: CDOTAPlayerController = PlayerResource.GetPlayer(keys.playerid);
            let vector: Vector = Vector(0, 0, 0);
            print('调用');
            print(player);
            print(player.GetPlayerID());
            GameUI.SetCameraTargetPosition(player, vector, 1);
        },
        ['adm']: function (keys) {
            let hero = PlayerResource.GetSelectedHeroEntity(keys.playerid);
            hero.StartGesture(1503);
            print('播放动画');
        },
        ['-ts']: function (keys, arr) {
            print('设置英雄属性:' + arr[2] + '为' + arr[3]);
            let hero = PlayerResource.GetSelectedHeroEntity(keys.playerid);
            hero.set(arr[2], Number(arr[3]));
        },
        ['-debug']: function () {
            _InDebug = !_InDebug;
            if (_InDebug) {
                print('[开启]调试模式:额外显示一些打印信息');
            } else {
                print('[关闭]调试模式');
            }
        },
        ['-test1']: function (keys) {
            print('------传输测试[调用发送给所有玩家客户端]----');
            const playerId = keys.playerid;
            const player = PlayerResource.GetPlayer(playerId);
            const data = { data: GameRules.GetGameTime() };
            CustomGameEventManager.Send_ServerToPlayer(player, 'test', data as never);
            // print('无延迟打印');
            // Timers.CreateTimer(0.01, () => {
            //     print('0.01秒延迟');
            // });
            // Timers.CreateTimer(0.05, () => {
            //     print('0.05秒延迟');
            // });
            // Timers.CreateTimer(0.2, () => {
            //     print('0.2秒延迟');
            // });
            // Timers.CreateTimer(0.4, () => {
            //     print('0.4秒延迟');
            // });
        },
        ['-test2']: function (keys) {
            let n = 0;
            const playerId = keys.playerid;
            const player = PlayerResource.GetPlayer(playerId);
            CustomGameEventManager.Send_ServerToPlayer(player, 'test', { 力量: 5 } as never);
        },
        ['-test3']: function (keys) {
            print('------传输测试[网表传输]----');
            CustomNetTables.SetTableValue('my_table' as keys, 'my_key' as never, { 力量: 5 } as never);
        },

        ['-test4']: function (keys) {
            let n = 0;
            const time = GameRules.GetGameTime();
            CustomNetTables.SetTableValue('my_table' as keys, 'my_key2' as never, { 敏捷: 5 } as never);
        },

        ['-test5']: function (keys) {
            print('------传输测试[网表传输]----');
            let n = 0;
            CustomNetTables.SetTableValue('my_table' as keys, 'my_key2' as never, { 智力: 5 } as never);
            // Timers.CreateTimer(0.01, () => {
            //     n = n + 1;
            //     CustomNetTables.SetTableValue('test1' as keys, 'my_key2' as never, { time: n } as never);
            //     return 0.01;
            // });
            // Timers.CreateTimer(0.01, () => {
            //     n = n + 1;
            //     CustomNetTables.SetTableValue('test1' as keys, 'my_key2' as never, { time: n } as never);
            //     return 0.01;
            // });
            // Timers.CreateTimer(0.01, () => {
            //     n = n + 1;
            //     CustomNetTables.SetTableValue('test1' as keys, 'my_key2' as never, { time: n, time2: str } as never);
            // });
            // Timers.CreateTimer(0.01, () => {
            //     n = n + 1;
            //     CustomNetTables.SetTableValue('test1' as keys, 'my_key2' as never, { time: n, time2: str } as never);
            // });
        },
    };

    constructor() {
        // print('[组件]Debug组件加载成功!');
        const id = MyGame.event(`player_chat`, keys => this.OnPlayerChat(keys), this);
        this.GameEvents.push(id);
    }
    OnPlayerChat(keys: GameEventProvidedProperties & PlayerChatEvent): void {
        const text = keys.text;
        text.toLowerCase(); //将text转换为小写
        const playerId = keys.playerid;
        let arr = text.split(' ');
        if (this.callTable[arr[0]]) {
            this.callTable[arr[0]](keys, arr);
        } else {
            print('没有找到对应的命令');
        }
    }
    remove() {
        //移除监听
        this.GameEvents.forEach(eventId => {
            MyGame.eventRemove(eventId);
        });
    }
}
