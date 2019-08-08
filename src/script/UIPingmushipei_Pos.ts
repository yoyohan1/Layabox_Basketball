export default class UIPingmushipei_Pos extends Laya.Script {

    /** @prop {name:isFixedHeight, tips:"是否是高度自适应 相反为宽度自适应", type:boolean, default:true}*/
    public isFixedHeight: boolean;
    /** @prop {name:isNeedUpdate, tips:"是否需要在Update里一直设置UI自适应", type:boolean, default:false}*/
    public isNeedUpdate: boolean;

    private label: Laya.Label;
    private designWidth: number;//设计时舞台配置的宽度
    private designHeight: number;//设计时舞台配置的高度
    private curWidth: number;//当前屏幕的宽度
    private curHeight: number;//当前屏幕的高度
    private preX: number;//设计时属性面板配置的X坐标
    private preY: number;//设计时属性面板配置的Y坐标


    constructor() {
        super();
        this.isFixedHeight = true;
        this.isNeedUpdate = false;
    }

    //注意：需提前在属性面板 把锚点设置为该组件的宽高的中心，不然运算起来有误差 anchorX anchorY
    onStart(): void {

        this.label = this.owner as Laya.Label;

        this.designWidth = Laya.stage.designWidth;
        this.designHeight = Laya.stage.designHeight;
        this.curWidth = Laya.stage.width;
        this.curHeight = Laya.stage.height;
        this.preX = this.label.x;
        this.preY = this.label.y;
        this.setUIShipei();
    }

    setUIShipei(): void {
        if (this.isNeedUpdate == true) {
            this.curWidth = Laya.stage.width;
            this.curHeight = Laya.stage.height;
        }

        console.log(this.isFixedHeight);
        if (this.isFixedHeight == true) {
            var radioX = (this.curWidth / this.curHeight) / (this.designWidth / this.designHeight);
            console.log("radioX" + radioX);
            radioX -= 1;
            this.label.x = this.preX + this.preX * radioX;
        }
        else {
            var radioY = (this.curHeight / this.curWidth) / (this.designHeight / this.designWidth);
            console.log("radioY" + radioY);
            radioY -= 1;
            this.label.y = this.preY + this.preY * radioY;
        }
    }

    onUpdate(): void {
        if (this.isNeedUpdate == true) {
            this.setUIShipei();
        }
    }
}