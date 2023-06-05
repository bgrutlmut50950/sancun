/**
 * 伤害系统
 * 伤害系统依赖数值系统,如果未对单位定义数值组件则不处理
 **/

import { reloadable } from '../../utils/tstl-utils';
import { pseudoRandom } from '../_debug/PRD/pseudoRandom'; //补偿随机算法
import { PropertyComp } from './PropertyComp'; //补偿随机算法

type filterTable = {
    entindex_attacker_const: EntityIndex;
    entindex_victim_const: EntityIndex;
    damagetype_const: number;
    damage: number;
};

@reloadable
class DamageSys {
    static _const = ['', 'Attack', 'Spell'];
    private _original: any; //原生伤害数据
    private attacker: CDOTA_BaseNPC; //伤害来源
    private victim: CDOTA_BaseNPC; //受伤者
    private type: string; //伤害类型
    // private attackType: string; //攻击类型(远程,近程)
    private isCritical: boolean; //是否暴击
    private damage: number; //伤害值

    constructor(damages: filterTable) {
        this._original = damages;
        this.attacker = EntIndexToHScript(damages.entindex_attacker_const) as CDOTA_BaseNPC;
        this.victim = EntIndexToHScript(damages.entindex_victim_const) as CDOTA_BaseNPC;
        this.type = DamageSys._const[damages.damagetype_const];
        this.damage = damages.damage;
        if (this.preJudge()) {
            this.onStart();
        }
    }

    //前置判定
    preJudge(): boolean {
        //伤害系统依赖数值系统,如果未对单位定义数值组件则不处理
        if (!this.attacker.Property) return false;
        if (!this.victim.Property) return false;
        return true;
    }

    //伤害开始
    onStart() {
        this.onCommon();

        //根据伤害类型执行相关处理
        if (this['on' + this.type]) {
            this['on' + this.type]();
        }
        this.onEnd();
    }

    //通用处理
    onCommon() {
        //通用伤害增幅
        //特殊处理
    }

    //普通攻击处理
    onAttack() {
        //暴击处理
        const rate = this.attacker.calc('会心率', this.victim) * 100;
        if (pseudoRandom(this.attacker.entindex() + '物理暴击', rate)) {
            this.isCritical = true;
            this.damage = this.damage * this.attacker.get('会心伤害');
        }
        //物抗处理
        const miti = this.victim.calc('PR', this.attacker);
        this.damage = this.damage * (1 - miti);
        if (_InDebug) {
            print('会心值:' + this.attacker.get('会心值'));
            print(this.attacker.Property._会心值);
            print('暴击率:' + Math.ceil(rate) + '%');
            if (this.isCritical) {
                print('暴击触发:伤害增幅' + this.attacker.get('会心伤害') + '倍');
            }
            print('原本伤害:' + this._original.damage);
            print('实际伤害:' + Math.ceil(this.damage));
            print('[受伤者]单位等级:' + this.victim.get('等级'));
            print('[受伤者]护甲:' + this.victim.get('AC'));
            print('[攻击单位]等级修正:' + this.attacker.get('LV_EM'));
            print('[本次伤害]物理抗性:' + math.floor(miti * 100) + '%');
        }
    }

    //技能伤害处理
    onSpell() {
        //魔抗处理
        const miti = this.victim.calc('MR', this.attacker);
        this.damage = this.damage * (1 - miti);
        if (_InDebug) {
            print('原本伤害:' + this._original.damage);
            print('实际伤害:' + this.damage);
            print('[受伤者]单位等级:' + this.victim.get('LV'));
            print('[受伤者]魔抗:' + this.victim.get('SR'));
            print('[攻击单位]等级修正:' + this.attacker.get('LV_EM'));
            print('[本次伤害]魔法抗性:' + math.floor(miti * 100) + '%');
        }
    }

    //伤害结算
    onEnd() {
        this._original.damage = this.damage;
    }

    //伤害显示
    onShow() {}

    // //伤害预处理
    // onPre(): boolean {
    //     //目标存活判定
    //     if (!this.victim) {
    //         return false;
    //     }

    //     if (!this.victim.IsAlive()) {
    //         return false;
    //     }

    //     this.damage = this._original.damage;
    //     if (this.damage <= 0) {
    //         return false;
    //     }

    //     //还原真实伤害

    //     return true;
    // }

    // //反击被动处理
    // onCounter() {
    //     //触发某些反击卡牌效果
    // }

    // //物理伤害额外处理
    // onPhysical() {
    //     // let armor = this.victim.GetPhysicalArmorValue(false);
    //     // this.damage = (this.damage * patkModify) / armor
    //     //闪避判定
    //     //格挡判定
    //     //物理暴击(补偿随机示例)
    //     //let rate = this.attacker.getCustom('暴击率')
    //     //暴击抗性计算
    //     // if (pseudoRandom(this.attacker.id+"物理暴击",rate)) {
    //     //   this.isCritical = true
    //     //   this.damage = this.damage * this.attacker.getCustom('暴击伤害')
    //     // }
    //     //物理伤害增幅
    //     //物理伤害减免
    //     //物理伤害修正
    //     //....其他处理
    //     //物理穿透
    //     //物理吸血
    //     //物理反弹
    //     //物理减甲
    // }

    // //法术伤害额外处理
    // onMagic() {
    //     //法术伤害增幅
    //     //法术伤害减免
    //     //法术伤害修正
    // }

    // //真实伤害额外处理
    // onReal() {}
}

export class DamageComp {
    private PropertyComp: PropertyComp;
    constructor() {
        this.PropertyComp = new PropertyComp();
        MyGame.Game.SetDamageFilter(event => this.OnDamage(event), this);
    }
    OnDamage(event) {
        if (event.damage <= 0) return true;
        new DamageSys(event);
        return true;
    }
    remove() {
        MyGame.Game.ClearDamageFilter();
        this.PropertyComp.remove();
    }
}
