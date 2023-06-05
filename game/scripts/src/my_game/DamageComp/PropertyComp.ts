import { reloadable } from '../../utils/tstl-utils';
// const PropertyType = require('./PropertyType.json');
import * as PropertyType from './json/PropertyType.json';
import * as Monsters from './json/Monsters.json';
type MonsterKey = keyof typeof Monsters;

//扩展单位属性
declare global {
    interface CDOTA_BaseNPC {
        Property: any; //根据单位类型,自动创建对应的属性系统
        get(key: string): any;
        set(key: string, value: any): void;
        add(key: string, value: any): void;
        sub(key: string, value: any): void;
        calc(key: string, target: CDOTA_BaseNPC): any;
    }
}

//扩展单位的方法
CDOTA_BaseNPC.get = function (key: string): any {
    if (!this.Property) return;
    return this.Property.get(key);
};
CDOTA_BaseNPC.set = function (key: string, value): any {
    if (!this.Property) return;
    return this.Property.set(key, value);
};
CDOTA_BaseNPC.add = function (key: string, value): any {
    if (!this.Property) return;
    return this.Property.add(key, value);
};
CDOTA_BaseNPC.sub = function (key: string, value): any {
    if (!this.Property) return;
    return this.Property.sub(key, value);
};
CDOTA_BaseNPC.calc = function (key: string, target: CDOTA_BaseNPC): any {
    if (!this.Property) return;
    return this.Property.calc(key, target);
};

/**
 * @description: 基础属性
 * 当你未设置属性时,获取的是根据其他属性自动计算的属性
 * 如果你设置了属性,则获取的是你设置的属性,并且无法再进行自动计算
 * 对于怪物属性,一般采用自动计算,对于英雄属性,一般采用手动设置
 */
@reloadable
class BaseProperty {
    public _LV: number = 0; //等级
    public _LV_EM: number; //等级修正
    public _ATK: number; //攻击力
    public _AC: number; //护甲
    public _SR: number; //魔抗
    public _HP_RJ: number; //生命回复
    public _HP_MAX: number; //生命上限
    public _格挡值: number; //格挡值
    public _闪避值: number; //闪避值
    public _会心值: number; //会心值
    public _会心伤害: number; //会心伤害

    set LV(value: number) {
        this._LV = value;
    }

    get LV(): number {
        return this._LV;
    }

    set LV_EM(value: number) {
        this._LV = value;
    }
    get LV_EM() {
        return this._LV_EM ?? this._LV * 10;
    }

    set ATK(value: number) {
        this._ATK = value;
    }

    get ATK(): number {
        return this._ATK ?? this.LV * 10 + 5;
    }

    set AC(value: number) {
        this._AC = value;
    }

    get AC(): number {
        return this._AC ?? this.LV * 4;
    }

    set SR(value: number) {
        this._SR = value;
    }

    get SR(): number {
        return this._SR || this.AC;
    }

    set HP_RJ(value: number) {
        this._HP_RJ = value;
    }

    get HP_RJ(): number {
        return this._HP_RJ ?? this.LV * 0.5 + 0.5;
    }

    set HP_MAX(value: number) {
        this._HP_MAX = value;
    }

    get HP_MAX(): number {
        return this._HP_MAX || this.LV * 10 + 100;
    }

    get 格挡值(): number {
        return this._格挡值 || 0;
    }

    set 格挡值(value: number) {
        this._格挡值 = value;
    }

    get 闪避值(): number {
        return this._闪避值 || 0;
    }

    set 闪避值(value: number) {
        this._闪避值 = value;
    }

    get 会心值(): number {
        return this._会心值 || 0;
    }

    set 会心值(value: number) {
        this._会心值 = value;
    }

    get 会心伤害(): number {
        return this._会心伤害 || 1.5;
    }

    set 会心伤害(value: number) {
        this._会心伤害 = value;
    }
}

/**
 * @description: 基本计算公式
 * 进行一些护甲,魔抗,闪避,格挡等计算
 * 作为基类使用,不应该被实例化
 * 在实例化时,可以针对不同的单位类型进行继承改写计算逻辑
 */
@reloadable
class CountingProcess extends BaseProperty {
    constructor() {
        super();
    }
    //物理抗性
    PR(target): number {
        return this.AC / (this.AC + target.get('LV_EM'));
    }

    //魔法抗性
    MR(target): number {
        return this.SR / (this.SR + target.get('LV_EM'));
    }

    格挡率(target) {
        return this.格挡值 / (this.格挡值 + target.get('等级修正'));
    }

    闪避率(target) {
        return this.闪避值 / (this.闪避值 + target.get('等级修正'));
    }

    会心率(target) {
        return this.会心值 / (this.会心值 + target.get('等级修正') * 0.5 + 15);
    }
}

//怪物资产
@reloadable
class MonsterProperty extends CountingProcess {
    constructor() {
        super();
    }
}

//英雄资产
@reloadable
class HeroProperty extends CountingProcess {
    public _STR: number = 0; //力量
    public _AGI: number = 0; //敏捷
    public _INT: number = 0; //智力
    constructor() {
        super();
    }
    set STR(value: number) {
        this._STR = value;
    }
    get STR(): number {
        return this._STR;
    }
    set AGI(value: number) {
        this._AGI = value;
    }
    get AGI(): number {
        return this._AGI;
    }
    set INT(value: number) {
        this._INT = value;
    }
    get INT(): number {
        return this._INT;
    }
    set ATK(value: number) {
        this._ATK = value;
    }
    get ATK(): number {
        return this._ATK + this._STR * 0.2 + this._AGI * 0.2 + this._INT * 0.2;
    }
    get 格挡值(): number {
        return (this._格挡值 || 0) + this._STR * 0.2;
    }

    get 闪避值(): number {
        return (this._闪避值 || 0) + this._AGI * 0.1;
    }

    set 会心值(value: number) {
        this._会心值 = value;
    }

    get 会心值(): number {
        return (this._会心值 || 0) + this._AGI * 0.1;
    }

    get SR(): number {
        return this._SR + this._INT * 0.2;
    }
}

//基础英雄
@reloadable
class BaseHeroProperty extends HeroProperty {
    constructor() {
        super();
    }
    //初始化属性
    init(unit: CDOTA_BaseNPC) {
        unit.set('STR', 5);
        unit.set('AGI', 5);
        unit.set('INT', 5);
        unit.set('ATK', 10);
        unit.set('AC', 2);
        print('定义初始属性');
    }
}

//战士英雄
@reloadable
class WarriorProperty extends HeroProperty {
    //转职时进行继承原本的属性
    constructor(baseHero?) {
        super();
        if (baseHero) {
            for (let prop in baseHero) {
                if (typeof baseHero[prop] !== 'function') {
                    this[prop] = baseHero[prop];
                }
            }
        }
    }
    get ATK(): number {
        return this._ATK + this._STR * 2;
    }
    get 格挡值(): number {
        return this._格挡值 + this._STR * 0.3;
    }
}

//法师英雄
@reloadable
class MageProperty extends HeroProperty {
    constructor(baseHero?) {
        super();
        if (baseHero) {
            for (let prop in baseHero) {
                if (typeof baseHero[prop] !== 'function') {
                    this[prop] = baseHero[prop];
                }
            }
        }
    }
    get ATK(): number {
        return this._ATK + this._INT * 2;
    }
}

//刺客英雄
@reloadable
class AssassinProperty extends HeroProperty {
    constructor(baseHero?) {
        super();
        if (baseHero) {
            for (let prop in baseHero) {
                if (typeof baseHero[prop] !== 'function') {
                    this[prop] = baseHero[prop];
                }
            }
        }
    }
    get ATK(): number {
        return this._ATK + this._STR + this._AGI;
    }
}

//可供实例化的属性类型
const property = {
    Monster: MonsterProperty, //怪物属性
    Hero: HeroProperty, //英雄属性基类
    BaseHero: BaseHeroProperty, //基础英雄属性
};

@reloadable
export class Property {
    public unit: CDOTA_BaseNPC;
    public type: string;
    public property = {};
    constructor(unit: CDOTA_BaseNPC, type: string) {
        this.unit = unit;
        this.type = type;
        this.initProperty();
    }
    //初始化属性系统
    initProperty() {
        this.unit.SetPhysicalArmorBaseValue(0);
        this.property = new property[this.type]();
        if (this.property['init']) {
            this.property['init'](this.unit);
        }
    }

    get(key: string) {
        key = PropertyType[key] ?? key;
        return this.property[key];
    }

    set(key: string, value: number) {
        key = PropertyType[key] ?? key;
        this.property[key] = value;
        Event.send('属性-变化', this.unit, key, value);
    }
    add(key: string, value: number) {
        key = PropertyType[key] ?? key;
        const v = this.property['_' + key] || this.property[key];
        this.set(key, v + value);
    }
    sub(key: string, value: number) {
        key = PropertyType[key] ?? key;
        const v = this.property['_' + key] || this.property[key];
        this.set(key, v - value);
    }
    //计算
    calc(key: string, target) {
        key = PropertyType[key] ?? key;
        return this.property[key](target);
    }
}

@reloadable
export class PropertyComp {
    private GameEvents = [];
    constructor() {
        print('[安装]数值系统');
        const id = MyGame.event('npc_spawned', events => this.onSpawned(events), this);
        this.GameEvents.push(id);
    }
    onSpawned(events) {
        const unit = EntIndexToHScript(events.entindex) as CDOTA_BaseNPC;
        const name = unit.GetUnitName() as MonsterKey;
        const data = Monsters[name];
        if (unit.Property) return;
        if (!data) {
            print(`[错误]未定义单位属性:${name}`);
            return;
        }
        const type = data.type;
        if (!property[type]) {
            print(`[错误]没有找到对应的属性类型${type}`);
            return;
        }
        unit.Property = new Property(unit, type);
        unit.Property.set('LV', data.lv);
    }
    remove() {
        print('[卸载]数值系统');
        this.GameEvents.forEach(eventId => {
            MyGame.eventRemove(eventId);
        });
    }
}

//声明nettable得test表
declare global {
    interface CustomNetTableDeclarations {
        test: any;
    }
}

Event.on('属性-变化', (unit: CDOTA_BaseNPC, key: string, value) => {
    //当属性变化时,改动test网表得内容   属性表-单位id-key-value
    const new_key = (unit.GetEntityIndex() + '-' + key) as any;
    CustomNetTables.SetTableValue('test', new_key, { key: value });
});
