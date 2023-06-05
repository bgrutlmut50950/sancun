/**
 * @fileoverview 玩家房间
 **/

/**
 * 处理玩家房间刷怪逻辑
 * 处理玩家各种房间内挑战
 * 通过区域事件来激活
 */

import { reloadable } from '../utils/tstl-utils';

declare global {
  interface CDOTAPlayerController {
    room: Room;
  }
}

@reloadable
class Room {
  player: CDOTAPlayerController;
  //存储当前房间怪物
  public monster: CDOTA_BaseNPC[] = [];
  //怪物出生点
  public monsterPos: Vector;
  public name: string;
  public id: PlayerID;

  constructor(player: CDOTAPlayerController) {
    this.player = player;
    this.id = player.GetPlayerID();
    this.name = 'circle_' + this.id;
    this.monsterPos = FindVecByName(this.name);
    //当触发区域被触发时
    Event.on('OnTrigger', trigger => {
      const unit = trigger.activator; //触发单位
      const caller = trigger.caller; //调用实体
      const callerName = caller.GetName(); //调用实体名字
      const sign = trigger.sign; //触发标记
      if (callerName == this.name) {
        if (sign == 'OnInt') {
          if (this.monster.length > 0) return;
          this.CreateMonster();
        } else if (sign == 'OnOut') {
          this.Clean();
        }
      }
    });
    Event.on('游戏-心跳', () => {
      // if (this.monster.length == 0) {
      //     this.OnC();
      // }
    });
    Event.on('单位-死亡', unit => {
      if (this.monster.includes(unit)) {
        this.monster = this.monster.filter(u => u != unit);
        if (this.monster.length == 0) {
          this.CreateMonster();
        }
      }
    });
  }

  //创建一组怪物，排列方式为圆形分布
  CreateMonster() {
    const center: Vector = this.monsterPos;
    const count = 5;
    const radius = 100;
    const angle = 360 / count;
    Timers.CreateTimer(0.5, () => {
      for (let i = 0; i < count; i++) {
        const pos = RotatePosition(center, QAngle(0, angle * i, 0), (center + Vector(radius, 0, 0)) as Vector);
        const unit = CreateUnitByName('npc_dota_creep_goodguys_melee', pos, true, undefined, undefined, 3);
        unit.SetForwardVector(((center - pos) as Vector).Normalized());
        this.monster.push(unit);
        unit.SetAcquisitionRange(500);
        unit.StartGesture(GameActivity.DOTA_RELAX_START);
        Event.send('单位-生成', unit, 'Monster');
        unit.set('LV', 1);
      }
    });
  }

  //打扫房间
  Clean() {
    this.monster.forEach(unit => {
      if (!unit.IsNull()) {
        unit.Destroy();
      }
    });
    this.monster = [];
  }

  public toString(): string {
    return 'Room: ' + this.name;
  }
}

//房间注册
export class RoomComp {
  constructor() {
    Event.on('玩家-选人阶段', () => this.init());
    MyGame.event('entity_killed', Dynamic_Wrap(this, 'onKilled' as never), this);
  }
  init() {
    for (let i = 0; i < PlayerResource.GetPlayerCount(); i++) {
      const player = PlayerResource.GetPlayer(i as PlayerID);
      player.room = new Room(player);
    }
  }
  onKilled(event: EntityKilledEvent) {
    Event.send('单位-死亡', EntIndexToHScript(event.entindex_killed));
  }
}
