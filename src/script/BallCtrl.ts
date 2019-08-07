export default class BallCtrl extends Laya.Script3D {

    private curBallState: BallState;
    private rigid: Laya.Rigidbody3D;

    private maxForce: number = 6.5;
    private minForce: number = 4.5;
    private addForce: number;
    private groupSpeed: number;

    constructor() { super(); }

    onAwake(): void {
        this.rigid = this.owner.getComponent(Laya.Rigidbody3D);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.curBallState = BallState.Idle;

        this.groupSpeed = (this.maxForce - this.minForce) / 2.5;
        this.addForce = 0;
    }

    onUpdate(): void {
        var dt = Laya.timer.delta / 1000;
        if (this.curBallState == BallState.AddForce) {
            this.addForce += dt * this.groupSpeed;
            if (this.addForce > this.maxForce - this.minForce) {
                this.addForce = this.maxForce - this.minForce;
            }

            var per = this.addForce / (this.maxForce - this.minForce);
            per = per > 1 ? 1 : per;
            Laya.stage.event("set_slider_value", per);
        }
    }

    onMouseDown(): void {
        console.log("onMouseDown!");
        Laya.stage.event("hideTweener");
        if (this.curBallState != BallState.Idle) {
            return;
        }
        this.curBallState = BallState.AddForce;
    }

    onMouseUp(): void {
        console.log("onMouseUp!");
        if (this.curBallState != BallState.AddForce) {
            return;
        }
        this.curBallState = BallState.Throw;
        this.thorwBall();
    }

    thorwBall(): void {
        if (this.curBallState != BallState.Throw) {
            return;
        }
        var speed = this.minForce + this.addForce;
        var vy = speed * Math.sin(Math.PI / 4);
        var vz = vy;

        this.rigid.linearVelocity = new Laya.Vector3(0, vy, vz);
        this.rigid.gravity = new Laya.Vector3(0, -10, 0);

        Laya.timer.once(5000, this, this.onCheckOut);
    }

    onCheckOut(): void {
        this.owner.removeSelf();

        Laya.stage.event("gen_new_ball");
    }

    onTriggerEnter(other: Laya.PhysicsComponent): void {
        if (this.curBallState == BallState.None) {
            return;
        }
        Laya.stage.event("success");
        this.curBallState = BallState.None;
    }

    onDestroy(): void {
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
    }
}
enum BallState {
    None,
    Idle,
    AddForce,
    Throw
}