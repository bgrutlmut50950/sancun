declare module '../GameMode' {
    interface GameMode {
        StageManager: StageManager;
    }
}

export class StageManager {
    public stage: number = 0; //当前阶段
    public bout: number = 1; //当前回合
    public time: number = 0; //当前阶段时间
    public time_m: number = 0; //心跳间隙
    public stage_name = '准备阶段';
    public stage_list: any[] = ['结算阶段', '探索阶段', 'BOSS阶段']; //阶段列表
    private stage_time: any[] = [10, 12, 13]; //阶段时间
    private eventId: number;
    private events: number[] = [];
    constructor() {
        let eventId = Event.on('游戏-开始', () => {
            if (this.eventId) Event.unregisterByID(this.eventId);
            this.eventId = Event.on('游戏-心跳', events => this.onHeartbeat(events));
            this.events.push(this.eventId);
            MyGame.StageManager = this;
        });
        this.events.push(eventId);

        eventId = Event.on('游戏-回合心跳', (mangager, time) => {
            const text = '第' + mangager.getBout() + '回合  ' + mangager.getStage() + ' ' + time;
            GameRules.XNetTable.SetTableValue('test_table', 'test_key', { data_1: text });
        });
        this.events.push(eventId);
    }

    //心跳
    private onHeartbeat(v: number) {
        this.time_m += v;
        if (this.time_m >= 1) {
            this.time_m = 0;
            this.time = this.time + 1;
            Event.send('游戏-回合心跳', this, this.time);
        }
        if (this.time >= this.stage_time[this.stage]) {
            Event.send('游戏-' + this.stage_name + '结束', this, this.stage);
            this.time = 0;
            this.stage = (this.stage + 1) % 3;
            this.stage_name = this.stage_list[this.stage];
            Event.send('游戏-' + this.stage_name + '开始', this, this.stage);
            Event.send('游戏-阶段变化', this, this.stage);
            this.onChangStage();
        }
    }

    //当阶段发生变化
    onChangStage() {
        if (this.stage == 0) {
            this.bout++;
            Event.send('游戏-回合开始', this, this.bout);
            this.stage_time[0] = 2;
        }
    }

    //获取当前阶段
    public getStageId() {
        return this.stage;
    }

    //获取当前阶段名
    public getStage() {
        return this.stage_name;
    }

    //结束当前阶段
    public endStage() {
        this.time = this.stage_time[this.stage];
    }

    //获取当前回合
    public getBout() {
        return this.bout;
    }

    public toString(): string {
        return `StageManager: stage=${this.stage}, bout=${this.bout}, time=${this.time}, stage_name=${this.stage_name}`;
    }

    //移除方法
    public remove() {
        this.events.forEach(eventId => Event.unregisterByID(eventId));
    }
}
