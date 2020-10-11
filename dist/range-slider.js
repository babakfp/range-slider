class RangeSlider{constructor(t={},i={}){if(!t||"DIV"!==t.nodeName&&"DIV"!==t.tagName)return;this.options={overlap:null,callbackFunction:null,min:null,max:null,start:null,end:null},this.init(i),this.topics={start:[],moving:[],stop:[]},this.UI={slider:null,handleLeft:null,handleRight:null,fill:null};const s=document.createElement("div");s.className="range-slider",this.UI.slider=s;const e=document.createElement("div");e.className="range-slider__handle range-slider__left-handle",this.UI.handleLeft=e,this.UI.slider.appendChild(this.UI.handleLeft);const n=document.createElement("div");n.className="range-slider__handle range-slider__right-handle",this.UI.handleRight=n,this.UI.slider.appendChild(this.UI.handleRight);const l=document.createElement("div");l.className="range-slider__rail",this.UI.rail=l,this.UI.slider.appendChild(this.UI.rail);const o=document.createElement("div");o.className="range-slider__rail-fill",this.UI.fill=o,this.UI.slider.appendChild(this.UI.fill),t.appendChild(this.UI.slider),this.UI.handleLeft.style.marginLeft="-"+e.offsetWidth/2+"px",this.UI.handleRight.style.marginRight="-"+n.offsetWidth/2+"px";const h={left:this.options.start,right:this.options.end};this.move.bind(this)(h,!0),this.startingHandler=this.starting.bind(this),this.UI.handleLeft.onmousedown=this.startingHandler,this.UI.handleLeft.ontouchstart=this.startingHandler,this.UI.handleRight.onmousedown=this.startingHandler,this.UI.handleRight.ontouchstart=this.startingHandler}get defaultOptions(){return{overlap:!1,callbackFunction:null,min:0,max:100}}extend(t={},i={}){const s={};let e;for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&(s[e]=t[e]);for(e in i)Object.prototype.hasOwnProperty.call(i,e)&&(s[e]=i[e]);return s}init(t={}){this.options="object"==typeof t?this.extend(this.defaultOptions,t):this.defaultOptions,this.options.start=this.options.start||this.options.min,this.options.end=this.options.end||this.options.max,this.options.max=parseFloat(this.options.max),this.options.min=parseFloat(this.options.min),this.options.max<this.options.min&&(this.options.min=this.options.max),void 0!==this.options.start&&void 0!==this.options.end&&this.options.start<=this.options.end&&this.options.start>=this.options.min&&this.options.end<=this.options.max?(this.options.start=parseFloat(this.options.start),this.options.end=parseFloat(this.options.end)):(this.options.start=this.options.min,this.options.end=this.options.max)}getInfo(){let t={};const i=this.options.max-this.options.min,s=this.UI.fill.style.left?parseFloat(this.UI.fill.style.left.replace("%","")):0,e=this.UI.fill.style.right?parseFloat(this.UI.fill.style.right.replace("%","")):0;return t={left:this.options.min+s/100*i,right:this.options.max-e/100*i},"function"==typeof this.options.callbackFunction&&(t.left=this._applyCallback_(t.left,this.options.callbackFunction),t.right=this._applyCallback_(t.right,this.options.callbackFunction)),t}_applyCallback_(t=null,i=null){try{return i?i.call(void 0,t):null}catch(t){throw t}}starting(t=null){if(!t)return;if(this.isDisabled)return;let i=0,s=0;for(this.dragObj={},this.dragObj.elNode=t.target;!this.dragObj.elNode.classList.contains("range-slider__handle");)this.dragObj.elNode=this.dragObj.elNode.parentNode;this.dragObj.dir=this.dragObj.elNode.classList.contains("range-slider__handle-left")?"left":"right",i=(void 0!==t.clientX?t.clientX:t.touches[0].pageX)+(window.scrollX||window.pageXOffset),s=(void 0!==t.clientY?t.clientY:t.touches[0].pageY)+(window.scrollY||window.pageYOffset),this.dragObj.cursorStartX=i,this.dragObj.cursorStartY=s,this.dragObj.elStartLeft=parseFloat(this.dragObj.elNode.style.left),this.dragObj.elStartRight=parseFloat(this.dragObj.elNode.style.right),isNaN(this.dragObj.elStartLeft)&&(this.dragObj.elStartLeft=0),isNaN(this.dragObj.elStartRight)&&(this.dragObj.elStartRight=0),this.UI.handleLeft.classList.remove("ontop"),this.UI.handleRight.classList.remove("ontop"),this.dragObj.elNode.classList.add("ontop"),this.movingHandler=this.moving.bind(this),this.stopHandler=this.stop.bind(this),document.addEventListener("mousemove",this.movingHandler,!0),document.addEventListener("mouseup",this.stopHandler,!0),document.addEventListener("touchmove",this.movingHandler,!0),document.addEventListener("touchend",this.stopHandler,!0),this.stopDefault.bind(this)(t),this.UI.fill.classList.remove("range-slider-transition"),this.UI.handleLeft.classList.remove("range-slider-transition"),this.UI.handleRight.classList.remove("range-slider-transition"),this.publish("start",this.getInfo())}moving(t){const i=(void 0!==t.clientX?t.clientX:t.touches[0].pageX)+(window.scrollX||window.pageXOffset),s=this.UI.slider.offsetWidth;let e=0;"left"===this.dragObj.dir?e=this.dragObj.elStartLeft+(i-this.dragObj.cursorStartX)/s*100:"right"===this.dragObj.dir&&(e=this.dragObj.elStartRight+(this.dragObj.cursorStartX-i)/s*100),e<0?e=0:e>100&&(e=100),e=Math.abs(e);let n=0;this.options.overlap||(n=this.UI.handleRight.offsetWidth/this.UI.slider.offsetWidth*100);let l=0;"left"===this.dragObj.dir?(l=100-n-this.UI.fill.style.right.replace("%",""),l<=e&&(e=l),this.dragObj.elNode.style.left=e+"%",this.UI.fill.style.left=e+"%"):(l=100-n-this.UI.fill.style.left.replace("%",""),l<=e&&(e=l),this.dragObj.elNode.style.right=e+"%",this.UI.fill.style.right=e+"%"),this.stopDefault.bind(this)(t),this.publish("moving",this.getInfo())}stop(t){document.removeEventListener("mousemove",this.movingHandler,!0),document.removeEventListener("mouseup",this.stopHandler,!0),document.removeEventListener("touchmove",this.movingHandler,!0),document.removeEventListener("touchend",this.stopHandler,!0),this.stopDefault.bind(this)(t),this.publish("stop",this.getInfo())}move(t,i){let s=t;this.UI.fill.classList.add("range-slider-transition"),this.UI.handleLeft.classList.add("range-slider-transition"),this.UI.handleRight.classList.add("range-slider-transition");const e=this.options.max-this.options.min;if("object"==typeof s){if(s.left){s.left<this.options.min&&(s.left=this.options.min),s.left>this.options.max&&(s.left=this.options.max);const t=(s.left-this.options.min)/e*100;this.UI.handleLeft.style.left=t+"%",this.UI.fill.style.left=t+"%"}if(s.right){s.right<this.options.min&&(s.right=this.options.min),s.right>this.options.max&&(s.right=this.options.max);const t=(this.options.max-s.right)/e*100;this.UI.handleRight.style.right=t+"%",this.UI.fill.style.right=t+"%"}!this.options.overlap&&this.UI.handleLeft.offsetLeft+this.UI.handleLeft.offsetWidth>this.UI.handleRight.offsetLeft-1&&(this.UI.fill.style.left="0%",this.UI.fill.style.right="0%",this.UI.handleLeft.style.left="0%",this.UI.handleRight.style.right="0%")}else if(!isNaN(s)){s<this.options.min&&(s=this.options.min),s>this.options.max&&(s=this.options.max);const t=(s-this.options.min)/e*100;this.UI.handleLeft.style.left=t+"%",this.UI.fill.style.left="0%",this.UI.fill.style.right=100-t+"%"}i||this.publish("moving",this.getInfo())}stopDefault(t=null){t&&t.preventDefault()}disable(t){this.isDisabled=t,this.isDisabled?this.UI.slider.classList.add("range-slider--disabled"):this.UI.slider.classList.remove("range-slider--disabled")}subscribe(t=null,i=null){if(!t||!i)return{};if(!this.topics.hasOwnProperty.call(this.topics,t)||"string"!=typeof t||"function"!=typeof i)return{};const s=this.topics[t].push(i)-1;return{remove:function(){delete this.topics[t][s]}.bind(this)}}publish(t=null,i=null){t&&i&&this.topics.hasOwnProperty.call(this.topics,t)&&"string"==typeof t&&this.topics[t].forEach((function(t){t(i)}))}}"undefined"!=typeof module&&void 0!==module.exports?module.exports=RangeSlider:window.RangeSlider=RangeSlider;