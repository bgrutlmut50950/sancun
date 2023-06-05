import { GameConfig } from '../modules/GameConfig';
import { Debug } from './_debug/Debug';
import { PlayerRegister } from './Player';
import { Additional } from './Additional';
import { StageManager } from './StageManger';
import { RoomComp } from './Room';
import { DamageComp } from './DamageComp/DamageComp';
import { Laboratory } from './_debug/Laboratory';
// import { PropertyComp } from './propertyComp/PropertyComp';

//游戏会自动生成这个表中的组件
const sysList = [
    Additional, //附加功能
    Debug, //调试系统
    StageManager, //阶段管理器
    Laboratory, //测试实验室
    DamageComp, //伤害系统(内置属性系统)
];

export class sys_init {
    //存储各个组件
    private Comp: any[] = [];
    //加载核心组件(不可销毁)
    constructor() {
        new GameConfig(); // 游戏配置
        new RoomComp(); // 房间组件注册
        new DamageComp(); // 伤害组件注册
        new PlayerRegister(); // 注册玩家
    }

    //生成组件实例(重载重新生成)
    public Creation() {
        sysList.forEach(sys => {
            this.Comp.push(new sys());
        });
    }

    //销毁组件实例(重载时会销毁)
    public Destruction() {
        this.Comp.forEach(v => {
            if (v.remove) {
                v.remove();
            }
        });
        this.Comp = [];
    }
}
