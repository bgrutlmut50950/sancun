//一些附加功能
import { reloadable } from '../utils/tstl-utils';

@reloadable
export class Additional {
    //存储所有事件
    private events: number[] = [];
    constructor() {
        print('[安装]附加功能');
        //注册F2事件
        const eventId = Event.on('玩家-键盘点击', (playerId, key) => {
            //执行回城
            if (key == 'F2') {
                const player = PlayerResource.GetPlayer(playerId);
                this.onReturn(player);
            }
        });
        this.events.push(eventId);
    }
    onReturn(player: CDOTAPlayerController) {
        Event.send('玩家-回城', player);
    }
    //移除方法
    remove() {
        print('[卸载]附加功能');
        this.events.forEach(eventId => Event.unregisterByID(eventId));
    }
}
