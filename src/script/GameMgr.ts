import BallCtrl from "./BallCtrl";

export default class GameMgr extends Laya.Script {
    constructor() {
        super();

    }


    /** @prop {name:hSlider, tips:"进度条", type:Node, default:null}*/
    public hSlider: Laya.HSlider;
    /** @prop {name:scoreText, tips:"得分", type:Node, default:null}*/
    public scoreText: Laya.Label;
    /** @prop {name:hintText, tips:"开局小提示", type:Node, default:null}*/
    public hintText: Laya.Label;


    private ball_prefab: any;
    private scene3D: Laya.Scene3D;
    private part: Laya.ShuriKenParticle3D;

    private _score: number;
    public get score(): number {
        return this._score;
    }
    public set score(v: number) {
        this._score = v;
        this.scoreText.text = this._score + "";
    }

    private tweener1: Laya.Tween;
    private tweener2: Laya.Tween;

    onAwake(): void {
        Laya.Scene3D.load("res/scenes3D/LayaScene_game_scene/Conventional/game_scene.ls", Laya.Handler.create(this, this.onLoadSceneCmp));
        Laya.stage.on("gen_new_ball", this, this.onGenNewBall);
        Laya.stage.on("set_slider_value", this, this.SetSliderValue);
        Laya.stage.on("success", this, this.OnGoal);
        this.SetSliderValue(0);
        this.score = 0;

        this.tweenOver2();
        
        Laya.stage.on("hideTweener", this, () => {
            if (this.hintText.visible == true) {
                this.tweener1.clear();
                this.tweener2.clear();
                this.hintText.visible = false;
            }
        });
    }

    private tweenOver1(): void {
        if (this.tweener1 != null) {
            this.tweener1.clear();
        }

        this.tweener2 = Laya.Tween.to(this.hintText, { "alpha": 1 },500, Laya.Ease.linearNone, Laya.Handler.create(this, this.tweenOver2));
    }

    private tweenOver2(): void {
        if (this.tweener2 != null) {
            this.tweener2.clear();
        }

        this.tweener1 = Laya.Tween.to(this.hintText, { "alpha": 0 }, 500, Laya.Ease.linearNone, Laya.Handler.create(this, this.tweenOver1));
    }


    private SetSliderValue(value: number): void {
        if (value < 0 || value >= 1) {
            return;
        }

        this.hSlider.value = value;
    }

    private onGenNewBall(): void {
        this.SetSliderValue(0);
        var newball = Laya.Sprite3D.instantiate(this.ball_prefab);
        this.scene3D.addChild(newball);
    }

    //得分
    private OnGoal(): void {
        console.log(this.part.name);
        this.part.particleSystem.play();
        this.score++;
    }

    private onLoadSceneCmp(scenes3D: Laya.Scene3D): void {
        Laya.stage.addChild(scenes3D);

        this.scene3D = scenes3D;
        scenes3D.zOrder = -1;
        var ball = scenes3D.getChildByName("ball");
        ball.addComponent(BallCtrl);

        this.ball_prefab = Laya.Sprite3D.instantiate(ball as Laya.Sprite3D);
        this.part = scenes3D.getChildByName("particle") as Laya.ShuriKenParticle3D;
    }

    onEnable(): void {
        console.log("onEnable!!!!!");
    }

    onDisable(): void {
    }
}