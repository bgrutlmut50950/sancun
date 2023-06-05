//一个实验系统，用于伤害测试，技能测试
//导入模块
import { reloadable } from '../../utils/tstl-utils';

@reloadable
export class Laboratory {
  //存储实体点
  public origin_point: Vector;
  //测试木偶实体
  public units: CDOTA_BaseNPC[] = [];
  private GameEvents: EventListenerID[] = [];
  constructor() {
    this.origin_point = FindVecByName('Laboratory');
    //从左到右创建3个木偶
    this.Init();
  }
  木偶等级 = [1, 15, 60];

  Init() {
    for (let i = 0; i < 3; i++) {
      const unit = CreateUnitByName('npc_dota_dummy_target', (this.origin_point + (i - 1) * Vector(500, 0, 0)) as Vector, true, null, null, 3);
      //设置生命恢复速度为100
      unit.SetBaseHealthRegen(100);
      // Event.send('单位-生成', unit, 'Monster');
      unit.set('等级', this.木偶等级[i]);
      //设置护甲值
      // unit.SetPhysicalArmorBaseValue(this.木偶护甲[i]);
      // unit.SetForwardVector(Vector(0, 1, 0));
      this.units.push(unit);
    }
    const id = MyGame.event(`player_chat`, keys => this.OnPlayerChat(keys), this);
    this.GameEvents.push(id);
  }
  OnPlayerChat(keys) {
    if (keys.text == 'l') {
      const hero = PlayerResource.GetSelectedHeroEntity(keys.playerid);
      this.onInt(hero);
    }
  }
  onInt(unit) {
    const player = unit.GetPlayerOwner();
    const p = this.origin_point - Vector(0, 400, 0);
    unit.SetAbsOrigin(p);
    GameUI.SetCameraTargetPosition(player, this.origin_point, 0.3);
  }
  onEnable() {
    //初始化
    //注册事件
    this.registerEvent();
  }
  onDisable() {
    //关闭事件
    this.closeEvent();
  }
  initData() {
    //初始化数据
  }
  registerEvent() {
    //注册事件
  }
  closeEvent() {
    //关闭事件
  }
  //移除监听
  remove() {
    this.units.forEach(unit => {
      unit.RemoveSelf();
    });
    this.GameEvents.forEach(eventId => {
      MyGame.eventRemove(eventId);
    });
  }
}
