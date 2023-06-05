import { reloadable } from '../utils/tstl-utils';
declare global {
    interface CDOTAPlayerController {
        Manager: Player;
    }
}

@reloadable
//玩家初始化
class Player {
    public id: PlayerID;
    public hero: CDOTA_BaseNPC_Hero;
    public player: CDOTAPlayerController;
    public origin_point: Vector;
    constructor(id: PlayerID) {
        this.id = id;
        this.player = PlayerResource.GetPlayer(id);
        //玩家出生点
        this.origin_point = FindVecByName('player_spawn_point_' + (id + 1));
        Timers.CreateTimer(0.5, () => this.OnHeroSpawned(), 0.5);
        //设置玩家实体的玩家管理器为该实例
        this.player.Manager = this;
    }
    OnHeroSpawned() {
        this.hero = PlayerResource.GetSelectedHeroEntity(this.id);
        if (!this.hero) {
            return 0.5;
        }
        //设置玩家英雄的出生点
        this.hero.SetAbsOrigin(this.origin_point);
        GameUI.SetCameraTargetPosition(this.player, this.origin_point, 1);
        Event.send('单位-生成', this.hero, 'BaseHero');
    }
    //回城
    OnReturn() {
        //判定回合阶段
        this.hero.Stop();
        let pfx_name = 'particles/econ/items/faceless_void/faceless_void_arcana/faceless_void_arcana_time_walk_preimage_combined.vpcf';
        let pfx = ParticleManager.CreateParticle(pfx_name, ParticleAttachment.CUSTOMORIGIN, null);
        ParticleManager.SetParticleControl(pfx, 0, this.hero.GetOrigin());
        ParticleManager.SetParticleControl(pfx, 1, this.hero.GetOrigin());
        ParticleManager.SetParticleControlEnt(pfx, 2, this.hero, ParticleAttachment.POINT, 'attach_hitloc', Vector(0, 0, 0), true);
        this.hero.StartGesture(GameActivity.DOTA_CAST_ABILITY_5);
        //设置玩家英雄回到
        Timers.CreateTimer(0.5, () => {
            this.hero.SetAbsOrigin(this.origin_point);
            GameUI.SetCameraTargetPosition(this.player, this.origin_point, 0.5);
        });
    }
}

//玩家注册接口
export class PlayerRegister {
    constructor() {
        Event.on('玩家-选人阶段', () => this.OnHeroSelection());
        Event.on('玩家-回城', player => player.Manager.OnReturn());
    }
    public OnHeroSelection() {
        for (let i = 0; i < PlayerResource.GetPlayerCount(); i++) {
            new Player(i as PlayerID);
        }
    }
}
