namespace sunnyboxs {
	/*[IF-FLASH]*/
	//import flash.utils.Dictionary;
	import Node = Laya.Node;
	import Handler = Laya.Handler;
	import Pool = Laya.Pool;
	import Browser = Laya.Browser;
	import Vector3 = Laya.Vector3;
	import Utils = Laya.Utils;
	import Utils3D = Laya.Utils3D;
	import Sprite = Laya.Sprite;
	import Transform3D = Laya.Transform3D;
	import Quaternion = Laya.Quaternion;
	import MeshSprite3D = Laya.MeshSprite3D;
	import BlinnPhongMaterial = Laya.BlinnPhongMaterial;
	import Vector4 = Laya.Vector4;
	import Ease = Laya.Ease;
	import Sprite3D = Laya.Sprite3D;
	import BaseMaterial = Laya.BaseMaterial;
	// import StandardMaterial = Laya.StandardMaterial;
	// import PBRMaterial = Laya.PBRMaterial;
	import PBRStandardMaterial = Laya.PBRStandardMaterial;
	import PBRSpecularMaterial = Laya.PBRSpecularMaterial;
	import ShurikenParticleMaterial = Laya.ShurikenParticleMaterial;
	import ExtendTerrainMaterial = Laya.ExtendTerrainMaterial;

	/**
	 * <code>Tween</code>  是一个缓动类。使用此类能够实现对目标对象属性的渐变。
	 * author: dcl-Cheng
	 */
	export class cTween {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/

		/**@private */
		/*[IF-FLASH]*/
		private static tweenMap: any;
		//[IF-JS] private static cTween.tweenMap:any[] = {};
		/**@private */
		private _complete: Handler;
		/**@private */
		private _target: any;
		/**@private */
		private _ease: Function;
		/**@private */
		private _props: any[];
		/**@private */
		private _duration: number;
		/**@private */
		private _delay: number;
		/**@private */
		private _startTimer: number;
		/**@private */
		private _usedTimer: number;
		/**@private */
		private _usedPool: boolean;
		/**@private */
		private _delayParam: any[];

		/**@private 唯一标识，TimeLintLite用到*/
		public gid: number = 0;
		/**更新回调，缓动数值发生变化时，回调变化的值*/
		public update: Handler;


		public static LoopType_None: string = "none";
		public static LoopType_Pingpong: string = "pingpong";
		public static LoopType_Loop: string = "loop";

		private _propsObject: Object;
		private _loop: string;
		private _isTo: boolean;
		private _material: BaseMaterial;
		private vector3_start: Vector3;
		private vector3_end: Vector3;
		private vector3_lerp: Vector3;
		private vector4_start: Vector4
		private vector4_end: Vector4
		private vector4_lerp: Vector4;
		/**
		 * 缓动对象的props属性到目标值。
		 * @param	target 目标对象(即将更改属性值的对象)。
		 * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param	duration 花费的时间，单位毫秒。
		 * @param	loop 缓动类型
		 * @param	ease 缓动类型，默认为匀速运动。
		 * @param	this.complete 结束回调函数。
		 * @param	delay 延迟执行时间。
		 * @param	coverBefore 是否覆盖之前的缓动。
		 * @param	autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
		 * @return	返回Tween对象。
		 */
		public static to(target: any, props: Object, duration: number, loop: string = cTween.LoopType_None, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false, autoRecover: boolean = true): cTween {
			return Pool.getItemByClass("ctween", cTween)._create(target, props, duration, loop, ease, complete, delay, coverBefore, true, autoRecover, true);
		}

		/**
		 * 从props属性，缓动到当前状态。
		 * @param	target 目标对象(即将更改属性值的对象)。
		 * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param	duration 花费的时间，单位毫秒。
		 * @param	ease 缓动类型，默认为匀速运动。
		 * @param	this.complete 结束回调函数。
		 * @param	delay 延迟执行时间。
		 * @param	coverBefore 是否覆盖之前的缓动。
		 * @param	autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
		 * @return	返回Tween对象。
		 */
		public static from(target: any, props: Object, duration: number, loop: string = cTween.LoopType_None, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false, autoRecover: boolean = true): cTween {
			return Pool.getItemByClass("ctween", cTween)._create(target, props, duration, loop, ease, complete, delay, coverBefore, false, autoRecover, true);
		}

		/**
		 * 缓动对象的props属性到目标值。
		 * @param	target 目标对象(即将更改属性值的对象)。
		 * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param	duration 花费的时间，单位毫秒。
		 * @param	ease 缓动类型，默认为匀速运动。
		 * @param	this.complete 结束回调函数。
		 * @param	delay 延迟执行时间。
		 * @param	coverBefore 是否覆盖之前的缓动。
		 * @return	返回Tween对象。
		 */
		public to(target: any, props: Object, duration: number, loop: string = cTween.LoopType_None, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false): cTween {
			return this._create(target, props, duration, loop, ease, complete, delay, coverBefore, true, false, true);
		}

		/**
		 * 从props属性，缓动到当前状态。
		 * @param	target 目标对象(即将更改属性值的对象)。
		 * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param	duration 花费的时间，单位毫秒。
		 * @param	ease 缓动类型，默认为匀速运动。
		 * @param	this.complete 结束回调函数。
		 * @param	delay 延迟执行时间。
		 * @param	coverBefore 是否覆盖之前的缓动。
		 * @return	返回Tween对象。
		 */
		public from(target: any, props: Object, duration: number, loop: string = cTween.LoopType_None, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false): cTween {
			return this._create(target, props, duration, loop, ease, complete, delay, coverBefore, false, false, true);
		}

		//3D  static function
		public static positionTo(target: Sprite3D, position: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			return cTween.to(target, { "position": position }, duration, loop, null, complete);
		}

		public static scaleTo(target: Sprite3D, scale: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {

			return cTween.to(target, { "scale": scale }, duration, loop, null, complete);
		}

		public static rotationTo(target: Sprite3D, rotation: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			;
			return cTween.to(target, { "rotationEuler": rotation }, duration, loop, null, complete);
		}

		public static localPositionTo(target: Sprite3D, position: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			return cTween.to(target, { "localPosition": position }, duration, loop, null, complete);
		}

		public static localScaleTo(target: Sprite3D, scale: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			return cTween.to(target, { "localScale": scale }, duration, loop, null, complete);
		}

		public static localRotationTo(target: Sprite3D, rotation: Vector3, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			return cTween.to(target, { "localRotationEuler": rotation }, duration, loop, null, complete);
		}

		public static colorTo(target: Sprite3D, color: Vector4, duration: number, loop: string = cTween.LoopType_None, complete: Handler = null): cTween {
			if (!<MeshSprite3D>target) return null;
			return cTween.to(target, { "color": color }, duration, loop, null, complete);
		}

		/** @private */
		public _create(target: any, props: any, duration: number, loop: string, ease: Function, complete: Handler, delay: number, coverBefore: boolean, isTo: boolean, usePool: boolean, runNow: boolean): cTween {
			if (!target) throw new Error("Tween:target is null");
			this._target = target;
			this._duration = duration;
			this._ease = ease || props["ease"];//|| cTween.easeNone()
			this._loop = loop || props["loop"] || cTween.LoopType_None;
			this._complete = this.complete || props["complete"];
			this._delay = delay;
			this._props = [];
			this._usedTimer = 0;
			this._startTimer = Browser.now();
			this._usedPool = usePool;
			this._delayParam = null;
			this.update = props["update"];
			this._propsObject = {};
			this._propsObject = props;
			this._isTo = isTo;

			//判断是否覆盖			
			//[IF-JS]var gid:number = (target.$_GID || (target.$_GID = Utils.getGID()));
			/*[IF-FLASH]*/
			var gid: any = target;
			if (!cTween.tweenMap[this.gid]) {
				cTween.tweenMap[this.gid] = [this];
			} else {
				if (coverBefore) cTween.clearTween(target);
				cTween.tweenMap[this.gid].push(this);
			}
			this.toStart(target, props, isTo, runNow);
			return this;
		}

		private toStart(target: any, props: Object, isTo: boolean, runNow: boolean): void {
			if (runNow) {
				if (this._delay <= 0) this.firstStart(target, props, isTo);
				else {
					this._delayParam = [target, props, isTo];
					Laya.timer.once(this._delay, this, this.firstStart, this._delayParam);
				}
			} else {
				this._initProps(target, props, isTo);
			}
		}

		private firstStart(target: any, props: Object, isTo: boolean): void {
			this._delayParam = null;
			if (target.destroyed) {
				this.clear();
				return;
			}
			this._initProps(target, props, isTo);
			this._beginLoop();
		}

		private _initProps(target: any, props: Object, isTo: boolean): void {
			//初始化属性
			for (var p in props) {
				if (typeof target[p] == "number") {
					var start: number = isTo ? target[p] : props[p];
					var end: number = isTo ? props[p] : target[p];
					this._props.push([p, start, end - start, end]);
					if (!isTo) target[p] = start;
				}
				if (target.transform && target.transform[p] === Vector3) {
					this.vector3_lerp = new Vector3();
					this.vector3_start = isTo ? target.transform[p] : props[p];
					this.vector3_end = isTo ? props[p] : target.transform[p];
					this.vector3_end = new Vector3(this.clerp(this.vector3_start.x, this.vector3_end.x, 1), this.clerp(this.vector3_start.y, this.vector3_end.y, 1), this.clerp(this.vector3_start.z, this.vector3_end.z, 1));
					Vector3.subtract(this.vector3_end, this.vector3_start, this.vector3_lerp);
					this._props.push([p, this.vector3_start, this.vector3_lerp, this.vector3_end]);
					if (!isTo) target[p] = this.vector3_start;


				}
				if (p.toLowerCase() == "color" && (<MeshSprite3D>target)) {
					this._material = (<MeshSprite3D>target).meshRenderer.material;
					var oc: Vector4;
					//TODO 常用的材质，需要再添加
					// oc = (this.<StandardMaterial> _material).albedoColor;
					// oc = (this.<BlinnPhongMaterial> _material).albedoColor;
					// oc = (this.<PBRStandardMaterial> _material).albedoColor;
					// oc = (this.<PBRSpecularMaterial> _material).albedoColor;
					// oc = (this.<ShurikenParticleMaterial> _material).tintColor;	
					if (this._material["tintColor"]) oc = this._material["tintColor"];
					if (this._material["albedoColor"]) oc = this._material["albedoColor"];
					this.vector4_lerp = new Vector4();
					this.vector4_start = isTo ? oc : props[p];
					this.vector4_end = isTo ? props[p] : oc;
					Vector4.subtract(this.vector4_end, this.vector4_start, this.vector4_lerp)
					this._props.push([p, this.vector4_start, this.vector4_lerp, this.vector4_end]);
					if (!isTo) target[p] = this.vector4_start;
				}
			}
		}

		private _beginLoop(): void {
			Laya.timer.frameLoop(1, this, this._doEase);
		}

		/**执行缓动**/
		private _doEase(): void {
			this._updateEase(Browser.now());
		}

		/**@private */
		public _updateEase(time: number): void {
			var target: any = this._target;
			if (!target) return;

			//如果对象被销毁，则立即停止缓动
			/*[IF-FLASH]*/
			if (target === Node && target.destroyed) {
				return cTween.clearTween(target);
			}
			//[IF-JS]if (target.destroyed) return clearTween(target);

			var usedTimer: number = this._usedTimer = time - this._startTimer - this._delay;

			if (usedTimer < 0) return;
			if (usedTimer >= this._duration) return this.complete();
			var ratio: number = usedTimer > 0 ? this._ease(usedTimer, 0, 1, this._duration) : 0;
			var props: any[] = this._props;
			for (var i: number, n: number = props.length; i < n; i++) {
				var prop: any[] = props[i];
				if (typeof target[prop[0]] == "number") {
					target[prop[0]] = prop[1] + (ratio * prop[2]);
				}

				//3d   Position,RotationEular,Scale  
				//target = Sprite3d ，不能使用Transform3d对象，引擎会报莫名的错误。
				if (target.transform && target.transform[prop[0]] === Vector3) {
					target.transform[prop[0]] = new Vector3(
						prop[1].x + (ratio * prop[2].x),
						prop[1].y + (ratio * prop[2].y),
						prop[1].z + (ratio * prop[2].z));

					// target.transform.rotate(new Vector3(
					// 	(ratio * prop[2].x),
					// 	(ratio * prop[2].y),
					// 	(ratio * prop[2].z)),false,false);

					// target.transform.localRotation = this.Eular(new Vector3(
					// 	prop[1].x + (ratio * prop[2].x),
					// 	prop[1].y + (ratio * prop[2].y),
					// 	prop[1].z + (ratio * prop[2].z)));
				}

				//3d   材质更换颜色  
				//target = MeshSprite3D 
				if (prop[0].toLowerCase() == "color" && (<MeshSprite3D>target)) {
					var color: Vector4 = new Vector4(
						prop[1].x + (ratio * prop[2].x),
						prop[1].y + (ratio * prop[2].y),
						prop[1].z + (ratio * prop[2].z),
						1);
					if (this._material["albedoColor"])
						this._material["albedoColor"] = color;
					if (this._material["tintColor"])
						this._material["tintColor"] = color;
				}
			}
			if (this.update) this.update.run();
		}


		private Eular(v: Vector3): Quaternion {
			var q: Quaternion;
			var ex: number = v.x * 0.0174532925 / 2;
			var ey: number = v.y * 0.0174532925 / 2;
			var ez: number = v.z * 0.0174532925 / 2;
			var qx: number, qy: number, qz: number, qw: number;
			qx = Math.sin(ex) * Math.cos(ey) * Math.cos(ez) + Math.cos(ex) * Math.sin(ey) * Math.sin(ez);
			qy = Math.cos(ex) * Math.sin(ey) * Math.cos(ez) - Math.sin(ex) * Math.cos(ey) * Math.sin(ez);
			qz = Math.cos(ex) * Math.cos(ey) * Math.sin(ez) - Math.sin(ex) * Math.sin(ey) * Math.cos(ez);
			qw = Math.cos(ex) * Math.cos(ey) * Math.cos(ez) + Math.sin(ex) * Math.sin(ey) * Math.sin(ez);
			q = new Quaternion(qx, qy, qz, qw);
			return q;
		}

		private clerp(start: number, end: number, value: number): number {
			var min: number = 0.0;
			var max: number = 360.0;

			var half: number = Math.abs((max - min) * 0.5);
			var retval: number = 0.0;
			var diff: number = 0.0;
			if ((end - start) < -half) {
				diff = ((max - start) + end) * value;
				retval = start + diff;
			} else if ((end - start) > half) {
				diff = -((max - end) + start) * value;
				retval = start + diff;
			} else retval = start + (end - start) * value;
			return retval;
		}

		/**设置当前执行比例**/
		public set_progress(v: number): void {
			var uTime: number = v * this._duration;
			this._startTimer = Browser.now() - this._delay - uTime;
		}

		/**
		 * 立即结束缓动并到终点。
		 */
		public complete(): void {
			if (!this._target) return;
			//立即执行初始化
			Laya.timer.runTimer(this, this.firstStart);
			//缓存当前属性
			var target: any = this._target;
			var handler: Handler = this._complete;

			this.completeData();
			if (this.update) this.update.run();
			if (this._loop == cTween.LoopType_Loop || this._loop == cTween.LoopType_Pingpong) {
				this._usedTimer = 0;
				this._startTimer = Browser.now();
				this._props = [];
				this.toStart(target, this._propsObject, this._loop == cTween.LoopType_Pingpong ? true : this._isTo, true);
			} else {
				//清理
				this.clear();
			}
			//回调
			handler && handler.run();
		}

		/**
		 * 设置终点属性, 改变缓动类别数据
		 */
		private completeData(): void {
			//缓存当前属性
			var target: any = this._target;
			var props: any = this._props;
			for (var i: number, n: number = props.length; i < n; i++) {
				var prop: any[] = props[i];
				if (typeof typeof target[prop[0]] == "number") {

					if (this._loop == cTween.LoopType_Loop) {
						target[prop[0]] = prop[1];
						if (!this._isTo)
							target[prop[0]] = prop[3];
					} else {
						target[prop[0]] = prop[3];

					}
				}

				if (target.transform && target.transform[prop[0]] === Vector3) {
					if (this._loop == cTween.LoopType_Loop) {
						target.transform[prop[0]] = prop[1];
						if (!this._isTo)
							target.transform[prop[0]] = prop[3];
					} else {
						target.transform[prop[0]] = prop[3];
					}
				}
				if (prop[0].toLowerCase() == "color" && (<MeshSprite3D>target)) {
					var color: Vector4;
					if (this._loop == cTween.LoopType_Loop) {
						color = prop[1];
						if (!this._isTo)
							color = prop[3];
					} else {
						color = prop[3];
					}
					if (this._material["albedoColor"])
						this._material["albedoColor"] = color;
					if (this._material["tintColor"])
						this._material["tintColor"] = color;
				}

				if (this._loop == cTween.LoopType_Pingpong) {
					this._propsObject[prop[0]] = prop[1];

				}
			}
		}

		/**
		 * 暂停缓动，可以通过resume或restart重新开始。
		 */
		public pause(): void {
			Laya.timer.clear(this, this._beginLoop);
			Laya.timer.clear(this, this._doEase);
			Laya.timer.clear(this, this.firstStart);
			var time: number = Browser.now();
			var dTime: number;
			dTime = time - this._startTimer - this._delay;
			if (dTime < 0) {
				this._usedTimer = dTime;
			}

		}

		/**
		 * 设置开始时间。
		 * @param	startTime 开始时间。
		 */
		public setStartTime(startTime: number): void {
			this._startTimer = startTime;
		}

		/**
		 * 清理指定目标对象上的所有缓动。
		 * @param	target 目标对象。
		 */
		public static clearAll(target: any): void {
			/*[IF-FLASH]*/
			if (!target) return;
			//[IF-JS]if (!target || !target.$_GID) return;
			/*[IF-FLASH]*/
			var tweens: any[] = cTween.tweenMap[target];
			//[IF-JS]var tweens:any[] = cTween.tweenMap[target.$_GID];
			if (tweens) {
				for (var i: number, n: number = tweens.length; i < n; i++) {
					tweens[i]._clear();
				}
				tweens.length = 0;
			}
		}

		/**
		 * 清理某个缓动。
		 * @param	tween 缓动对象。
		 */
		public static clear(tween: cTween): void {
			tween.clear();
		}

		/**@private 同clearAll，废弃掉，尽量别用。*/
		public static clearTween(target: Object): void {
			cTween.clearAll(target);
		}

		/**
		 * 停止并清理当前缓动。
		 */
		public clear(): void {
			if (this._target) {
				this._remove();
				this._clear();
			}
		}

		/**
		 * @private
		 */
		public _clear(): void {
			this.pause();
			Laya.timer.clear(this, this.firstStart);
			this._complete = null;
			this._target = null;
			this._ease = null;
			this._props = null;
			this._delayParam = null;
			this._propsObject = null;
			if (this._usedPool) {
				this.update = null;
				Pool.recover("ctween", this);
			}
		}

		/** 回收到对象池。*/
		public recover(): void {
			this._usedPool = true;
			this._clear();
		}

		private _remove(): void {
			/*[IF-FLASH]*/
			var tweens: any[] = cTween.tweenMap[this._target];
			//[IF-JS]var tweens:any[] = cTween.tweenMap[this._target.$_GID];
			if (tweens) {
				for (var i: number, n: number = tweens.length; i < n; i++) {
					if (tweens[i] === this) {
						tweens.splice(i, 1);
						break;
					}
				}
			}
		}

		/**
		 * 重新开始暂停的缓动。
		 */
		public restart(): void {
			this.pause();
			this._usedTimer = 0;
			this._startTimer = Browser.now();
			if (this._delayParam) {
				Laya.timer.once(this._delay, this, this.firstStart, this._delayParam);
				return;
			}
			var props: any[] = this._props;
			for (var i: number, n: number = props.length; i < n; i++) {
				var prop: any[] = props[i];
				this._target[prop[0]] = prop[1];
			}
			Laya.timer.once(this._delay, this, this._beginLoop);
		}

		/**
		 * 恢复暂停的缓动。
		 */
		public resume(): void {
			if (this._usedTimer >= this._duration) return;
			this._startTimer = Browser.now() - this._usedTimer - this._delay;
			if (this._delayParam) {
				if (this._usedTimer < 0) {
					Laya.timer.once(-this._usedTimer, this, this.firstStart, this._delayParam);
				} else {
					this.firstStart.apply(this, this._delayParam);
				}
			} else {
				this._beginLoop();
			}
		}

		private static easeNone(t: number, b: number, c: number, d: number): number {
			return c * t / d + b;
		}
	}
}