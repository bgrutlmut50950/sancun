// import { numerSys } from './NumeratorComp';
// declare global {
//     interface CDOTA_BaseNPC {
//         numer: unitNumer;
//     }
// }

// export class unitNumer extends numerSys {
//     static event: number;
//     private map = new Map<string, number>();
//     private type: string;
//     constructor(unit: CDOTA_BaseNPC, type: string) {
//         super();
//         //获取单位类型
//         this.type = type;
//         unit.numer = this;
//         //获取对应属性逻辑
//         //属性生成
//         this['on' + type](unit);
//     }
//     public static init(unit: CDOTA_BaseNPC, type: string): unitNumer {
//         //判定参数正确性
//         if (unit.numer) return;
//         return new unitNumer(unit, type);
//     }
//     public set(k: string, v: number) {
//         this.map.set(k, v);
//     }
//     public add(k: string, v: number) {
//         const value: number = this.map.get(k) ?? 0;
//         this.map.set(k, value + v);
//     }
//     public sub(k: string, v: number) {
//         const value: number = this.map.get(k) ?? 0;
//         this.map.set(k, value - v);
//     }
//     public get(k: string) {
//         const v = this.map.get(k);
//         if (!v) {
//             let result: any = super[this.type][k];
//             return result;
//         }
//         return v;
//     }
//     public compute(k: string) {}
//     public onMonster(unit) {
//         // print('monster函数触发', unit.unitClassName);
//         // DeepPrintTable(unit);
//         let value = this.MONSTER_ATTRIBUTE.生命值(unit);
//         // print('-----------------------------------------', value);
//         this.set('等级', 5);
//         //生命值
//         this.set('生命值', this.get('生命值'));
//     }
// }

// if (!unitNumer.event) {
//     if (Event) {
//         unitNumer.event = Event.on('单位-生成', function (unit: CDOTA_BaseNPC, type: string) {
//             unitNumer.init(unit, type);
//         });
//     }
// }
