import { reloadable } from '../../utils/tstl-utils';

type attributeType = {
    type: string;
    value: any;
};
@reloadable
export class property {
    public modifer_list = {
        攻击力: 'base_attack_modifer',
        生命值: 'base_health_modifer',
        护甲: 'base_armor_modifier',
        力量: 'base_armor_strength',
        智力: 'base_armor_strength',
        敏捷: 'base_armor_strength',
    };
    public attributes = {
        等级: function (self) {
            return self.unit.GetLevel();
        },
    };

    public unit: CDOTA_BaseNPC;
    private _damage = {};
    constructor(unit: CDOTA_BaseNPC) {
        this.unit = unit;
    }

    set(key, value) {
        this._damage[key] = value;
        // print(key, value)
        this.modifer_event(key, value);
    }

    get(key) {
        return this._damage[key];
    }

    sub(key, value) {
        const v = this.get(key);
        this.set(key, v - value);
    }

    add(key, value) {
        const v = this.get(key);
        this.set(key, v + value);
    }

    modifer_event(key: string, value: number) {
        if (!this.modifer_list[key]) return;
        let modifer_name = this.modifer_list[key];
        let buff: CDOTA_Buff;
        if (this.unit.HasModifier(modifer_name)) {
            buff = this.unit.FindModifierByName(modifer_name);
            buff.SetStackCount(buff.GetStackCount() + 1);
        }
        if (!buff) this.unit.AddNewModifier(this.unit, null, modifer_name, { value: value });
    }
}
