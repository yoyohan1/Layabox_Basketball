import GameConfig from "./GameConfig";
class Main {
	constructor() {
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;

		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded(): void {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void {
		//加载IDE指定的场景
		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);

		//this.preLoadScene3D();
	}


	//预加载 好像只能预加载 场景中没用到的  不然加载了 场景中也加载 会报错
	preLoadScene3D(): void {
		///需要加载的3D资源列表   
		let res3DArray: Array<any> = [
			// { url: "res/scenes3D/LayaScene_game_scene/Conventional/Assets/res/modules/Models/Goal-Basketball_1_43.lm", type: Laya.Sprite3D },
			// { url: "res/scenes3D/LayaScene_game_scene/Conventional/Assets/res/modules/Models/GoalHoop-Basketball_1_43.lm", type: Laya.Sprite3D },
			// { url: "res/scenes3D/LayaScene_game_scene/Conventional/Assets/res/modules/GoalHoop-holder_1__1.lm", type: Laya.Sprite3D },
			{ url: "res/scenes3D/LayaScene_game_scene/Conventional/StarMaterial.lmat", type: Laya.BaseMaterial },
		];


		Laya.loader.create(res3DArray, Laya.Handler.create(this, () => {
			console.log("加载3D完成");
			GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
		}),
			Laya.Handler.create(this, (pro: number) => {
				console.log("加载3D进度：" + pro);
			}));

	}


}
//激活启动类
new Main();
