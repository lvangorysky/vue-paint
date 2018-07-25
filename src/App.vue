<template>
  <div id="app">
    <select @change="changeSelect" v-model="selected">
      <option value="line">line</option>
      <option value="arrow">arrow</option>
      <option value="circle">circle</option>
      <option value="rect">rect</option>
    </select>
    <div>
      <span>颜色:  </span>
      <input v-model="params.color" type="text">
    </div>
    <div>
      <span>粗细:  </span>
      <input v-model="params.lineWidth" type="text">
    </div>
    <div v-if="type.rect">
      <span>圆角:  </span>
      <input v-model="params.radius" type="text">
    </div>

    <div v-if="type.arrow">
      <span>箭头范围:  </span>
      <input v-model="params.range" type="text">
    </div>

    <div v-if="type.arrow">
      <span>箭头边长:  </span>
      <input v-model="params.edge" type="text">
    </div>

    <div v-if="type.arrow">
      <span>箭头角度:  </span>
      <input v-model="params.angle" type="text">
    </div>

    <canvas width="800" height="600"
    @mousedown="mouseDown($event)" 
    @mousemove="mouseMove($event)"
    @mouseup="mouseUp($event)"
    ref="canvas"></canvas>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      selected: 'rect',
      params: {
        color: '#333333',
        lineWidth: 2,
        radius: 4,
        range: 40,
        edge: 25,
        angle: 15
      },
      canvas: '',
      ctx: '',
      w: 0,
      h: 0,
      lock: false, //ismove
      status: {
        lineArr: [],
        arrowArr: [],
        circleArr: [],
        rectArr: []
      },
      type: {
        line: false,
        arrow: false,
        circle: false,
        rect: true
      },
      //画线参数
      clickDrag: [],
      lineX: [],
      lineY: [],
      //箭头参数
      beginPoint: {
        x: 0,
        y: 0
      },
      stopPoint: {
        x: 0,
        y: 0
      },
      //圆形参数
      storage: {
        x: 0,
        y: 0
      },
      rect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        realX: 0,
        realY: 0
      },
      polygonVertex: [],
      angle: 0,
    }
  },
  watch: {
    params: {
      handler: (val) => {
        
        let re = /^[0-9]+.?[0-9]*/ ;
        for(let i in val) {
          if(i !== 'color') {
            val[i] = Number(val[i])
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.$nextTick( () => {
      this.init();
    })    
  },
  methods: {
    changeSelect() {
      for (let i in this.type) {
        if (i == this.selected) {
          this.type[i] = true
        }else {
          this.type[i] = false
        }
      
      }
    },
    init() {
      this.canvas = this.$refs['canvas'];
      this.ctx = this.$refs['canvas'].getContext('2d');
      this.w = this.canvas.width;
      this.h = this.canvas.height;
    },
    mouseDown(e) {
      this.lock = true;
      if (this.type.line) {
        this.movePoint(e.offsetX, e.offsetY);
        this.drawPoint(this.lineX, this.lineY, this.clickDrag, this.params.lineWidth, this.params.color);
      }else if (this.type.arrow) {
        this.beginPoint.x = e.offsetX;
        this.beginPoint.y = e.offsetY;
      }else if (this.type.circle) {
        this.storage.x = e.offsetX;
        this.storage.y = e.offsetY;
      }else if (this.type.rect) {
        this.rect.x = e.offsetX;
        this.rect.y = e.offsetY;
      }
    },
    mouseMove(e) {
      if (this.lock) {
        if (this.type.line) {
          this.movePoint(e.offsetX, e.offsetY);
          this.drawPoint(this.lineX, this.lineY, this.clickDrag, this.params.lineWidth, this.params.color);
        }else if (this.type.arrow) {
          this.stopPoint.x = e.offsetX;
          this.stopPoint.y = e.offsetY;
          this.clearCanvas();
          this.redrawAll();
          this.arrowCoord(this.beginPoint, this.stopPoint, this.params.range, this.params.edge, this.params.angle);
          this.sideCoord();
          this.drawArrow(this.params.color);
        }else if (this.type.circle) {
          let pointX;
          let pointY;
          let lineX;
          let lineY;
          if (this.storage.x > e.offsetX) {
            pointX = this.storage.x - Math.abs(this.storage.x - e.offsetX) / 2
          }else {
            pointX = Math.abs(this.storage.x - e.offsetX) / 2 + this.storage.x;
          }
          if (this.storage.y > e.offsetY) {
            pointY = this.storage.y - Math.abs(this.storage.y - e.offsetY) / 2;
          } else {
            pointY = Math.abs(this.storage.y - e.offsetY) / 2 + this.storage.y;
          }
          lineX = Math.abs(this.storage.x - e.offsetX) / 2;
          lineY = Math.abs(this.storage.y - e.offsetY) / 2;
          this.clearCanvas();
          this.redrawAll();
          this.drawEllipse(pointX, pointY, lineX, lineY, this.params.lineWidth, this.params.color);
        }else if (this.type.rect) {
          this.rect.width = Math.abs(this.rect.x - e.offsetX);
          this.rect.height = Math.abs(this.rect.y - e.offsetY);
          if (this.rect.x > e.offsetX) {
            this.rect.realX = e.offsetX
          } else {
            this.rect.realX = this.rect.x
          }
          if (this.rect.y > e.offsetY) {
            this.rect.realY = e.offsetY
          } else {
            this.rect.realY = this.rect.y
          }
          this.clearCanvas();
          this.redrawAll();
          this.drawRect(this.rect.realX, this.rect.realY, this.rect.width, this.rect.height, this.params.radius, this.params.color, this.params.lineWidth)
        }
      }
    },
    mouseUp(e) {
      if (this.type.line) {
        this.status.lineArr.push({ x: this.lineX, y: this.lineY, clickDrag: this.clickDrag, lineWidth: this.params.lineWidth, color: this.params.color})
        this.lineX = [];
        this.lineY = [];
        this.clickDrag = [];
      }else if (this.type.arrow) {
        var tempObj = {
          beginPoint: this.beginPoint,
          stopPoint: { x: e.offsetX, y: e.offsetY },
          range: this.params.range,
          color: this.params.color
        }
        this.status.arrowArr.push(tempObj);
        this.beginPoint = {
          x: 0,
          y: 0
        };
      }else if (this.type.circle) {
        let pointX;
        let pointY;
        let lineX;
        let lineY;
        if (this.storage.x > e.offsetX) {
          pointX = this.storage.x - Math.abs(this.storage.x - e.offsetX) / 2
        }else {
          pointX = Math.abs(this.storage.x - e.offsetX) / 2 + this.storage.x;
        }
        if (this.storage.y > e.offsetY) {
          pointY = this.storage.y - Math.abs(this.storage.y - e.offsetY) / 2;
        } else {
          pointY = Math.abs(this.storage.y - e.offsetY) / 2 + this.storage.y;
        }
        lineX = Math.abs(this.storage.x - e.offsetX) / 2;
        lineY = Math.abs(this.storage.y - e.offsetY) / 2;
        this.status.circleArr.push({
          x: pointX,
          y: pointY,
          a: lineX,
          b: lineY,
          color: this.params.color,
          lineWidth: this.params.lineWidth
        });
        this.storage = {
        };
      }else if (this.type.rect) {
        this.status.rectArr.push({
          realX: this.rect.realX,
          realY: this.rect.realY,
          width: this.rect.width,
          height: this.rect.height,
          radius: this.params.radius,
          color: this.params.color,
          lineWidth: this.params.lineWidth
        })
        this.rect = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          realX: 0,
          realY: 0
        }
      }
      this.lock = false;
    },
    //绘制线
    movePoint(x, y) {
      this.lineX.push(x);
      this.lineY.push(y);
      this.clickDrag.push(y);
    },
    drawPoint(x, y, clickDrag, lineWidth, color) {
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = color;
      for(let i = 0; i < x.length; i++ ) {
        this.ctx.beginPath();
        if (clickDrag[i] && i) {
          this.ctx.moveTo(x[i-1], y[i-1]);
        }else {
          this.ctx.moveTo(x[i] - 1, y[i]);
        }
        this.ctx.lineTo(x[i], y[i]);
        this.ctx.closePath();
        this.ctx.stroke();
      }      
    },
    //绘制箭头
    arrowCoord(beginPoint, stopPoint, range, edgeLen, angle) {
      this.polygonVertex[0] = beginPoint.x;
      this.polygonVertex[1] = beginPoint.y;
      this.polygonVertex[6] = stopPoint.x;
      this.polygonVertex[7] = stopPoint.y;
      this.getRadian(beginPoint, stopPoint);
      this.polygonVertex[8] = stopPoint.x - edgeLen * Math.cos(Math.PI / 180 * (this.angle + range));
      this.polygonVertex[9] = stopPoint.y - edgeLen * Math.sin(Math.PI / 180 * (this.angle + range));
      this.polygonVertex[4] = stopPoint.x - edgeLen * Math.cos(Math.PI / 180 * (this.angle - range));
      this.polygonVertex[5] = stopPoint.y - edgeLen * Math.sin(Math.PI / 180 * (this.angle - range));
    },  
   sideCoord() {
      var midpoint = {};
      midpoint.x = (this.polygonVertex[4] + this.polygonVertex[8]) / 2;
      midpoint.y = (this.polygonVertex[5] + this.polygonVertex[9]) / 2;
      this.polygonVertex[2] = (this.polygonVertex[4] + midpoint.x) / 2;
      this.polygonVertex[3] = (this.polygonVertex[5] + midpoint.y) / 2;
      this.polygonVertex[10] = (this.polygonVertex[8] + midpoint.x) / 2;
      this.polygonVertex[11] = (this.polygonVertex[9] + midpoint.y) / 2;
    },
    getRadian(beginPoint, stopPoint) {
      this.angle = Math.atan2(stopPoint.y - beginPoint.y, stopPoint.x - beginPoint.x) / Math.PI * 180;
    },
    drawArrow(color) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.polygonVertex[0], this.polygonVertex[1]);
      this.ctx.lineTo(this.polygonVertex[2], this.polygonVertex[3]);
      this.ctx.lineTo(this.polygonVertex[4], this.polygonVertex[5]);
      this.ctx.lineTo(this.polygonVertex[6], this.polygonVertex[7]);
      this.ctx.lineTo(this.polygonVertex[8], this.polygonVertex[9]);
      this.ctx.lineTo(this.polygonVertex[10], this.polygonVertex[11]);
      this.ctx.closePath();
      this.ctx.fill();
    },
    //绘制圆圈
    drawEllipse(x, y, a, b, lineWidth, color) {
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, a, b, 0, 0, 2 * Math.PI);
      this.ctx.lineWidth = lineWidth;
      this.ctx.fillStyle = 'rgba(0,0,0,0)';
      this.ctx.strokeStyle = color;
      this.ctx.fill();
      this.ctx.stroke();
    },
    //绘制矩形
    drawRect(realX, realY, width, height, radius, color, lineWidth){
      this.createRect(realX, realY, width, height, radius, color, 'stroke', lineWidth)
    },
    createRect (x, y, width, height, radius, color, type ,lineWidth) { 
      //绘制圆
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + radius);
      this.ctx.lineTo(x, y + height - radius);
      this.ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      this.ctx.lineTo(x + width - radius, y + height);
      this.ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);                                                                                                                              
      this.ctx.lineTo(x + width, y + radius);
      this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
      this.ctx.lineTo(x + radius, y);
      this.ctx.quadraticCurveTo(x, y, x, y + radius);
      this.ctx[type + 'Style'] = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.closePath();
      this.ctx[type]();
    },
    //重绘canvas
    redrawAll() {
      let arrow = this.status.arrowArr;
      let line = this.status.lineArr;
      let circle = this.status.circleArr;
      let rect = this.status.rectArr;
      if (arrow.length) {
        arrow.forEach(val => {
          if (val.beginPoint != {}) {
            this.arrowCoord(val.beginPoint, val.stopPoint, val.range, 25, 15);
            this.sideCoord();
            this.drawArrow(val.color);
          }
        })
      };
      if (line.length) {
        line.forEach(val => {
          this.drawPoint(val.x, val.y, val.clickDrag, val.lineWidth, val.color)
        })
      };
      if(circle.length) {
        circle.forEach(val => {
          this.drawEllipse(val.x, val.y, val.a, val.b, val.lineWidth, val.color)
        })
      }
      if(rect.length) {
        rect.forEach(val => {
          this.drawRect(val.realX, val.realY, val.width, val.height, val.radius, val.color, val.lineWidth)
        })
      }
    },
    //清空画布
    clearCanvas() {
      this.ctx.clearRect(0,0,this.w,this.h)
    }
  }
}
</script>

<style>
  #app {
    margin: auto
  }
  select {
    display: block
  }
  input {
    /* display: block */
  }
  canvas {
    border: 1px solid #000; 
    display: block;
    margin: auto;
    height: 600px;
  }
</style>
