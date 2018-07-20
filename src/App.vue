<template>
  <div id="app">
    <canvas width="800" height="600"
    @mousedown="mouseDown($event)" 
    @mousemove="mouseMove($event)"
    @mouseup="mouseUp($event)"
    ref="canvas"></canvas>
    <!-- <button :disabled="count > 19 || count < 15">
    </button> -->
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      canvas: '',
      ctx: '',
      w: 0,
      h: 0,
      lock: false, //ismove
      clickDrag: [],
      lineX: [],
      lineY: [],
      status: {
        lineArr: []
      },
    }
  },
  created() {
    this.$nextTick( () => {
      this.init();
      console.log(this.$msg);
    })    
  },
  methods: {
    init() {
      this.canvas = this.$refs['canvas'];
      this.ctx = this.$refs['canvas'].getContext('2d');
      this.w = this.canvas.width;
      this.h = this.canvas.height;
    },
    mouseDown(e) {
      this.lock = true;
      this.movePoint(e.offsetX, e.offsetY);
      this.drawPoint(this.lineX, this.lineY, this.clickDrag, 3, '#000000');
    },
    mouseMove(e) {
      if(this.lock) {
        this.movePoint(e.offsetX, e.offsetY);
        this.drawPoint(this.lineX, this.lineY, this.clickDrag, 3, '#000000');
      }
    },
    mouseUp() {
      this.status.lineArr.push({ x: this.lineX, y: this.lineY, clickDrag: this.clickDrag, lineWidth: 3, color: '#000000'})
      this.lineX = [];
      this.lineY = [];
      this.clickDrag = [];
      this.lock = false;
    },
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
  canvas {
    border: 1px solid #000;
    
    margin: auto;
    height: 600px;
  }
</style>
