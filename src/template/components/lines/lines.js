class Lines {
	constructor(element, settings = {
		box: {
			size: 40,
			stroke: 1,
			opacity: 0.3,
			color: '#fff'
		},
		x: {
			stroke: 1,
			opacity: 0.1,
			color: '#fff',
		},
		line: {
			stroke: 2,
			opacity: 1,
			color: '#fff',
			speed: 100,
			dispersion: 1,
			rotatedFrom: 5,
			fadingPercent: 30 
		},
		layout: {
			sm: {
				0: {
					size: 20,
					min: 1,
					max: 3,
					step: 10,
					lines: 2,
					width: 360,
					height: 360,
				},
				768: {
					size: 30,
					min: 1,
					max: 3,
					step: 10,
					lines: 2,
					width: 360,
					height: 360,
				},
				1024: {
					size: 40,
					min: 1,
					max: 3,
					step: 10,
					lines: 2,
					width: 324,
					height: 324,
				},
			},
			lg: {
				0: {
					size: 20,
					min: 2,
					max: 5,
					step: 5,
					lines: 2, 
				},
				768: {
					size: 30,
					min: 2,
					max: 5,
					step: 5,
					lines: 3, 
				},
				1024: {
					size: 40,
					min: 2,
					max: 10,
					step: 5,
					lines: 5,
					width: 2560,
					height: 1400
				},
			}
		},
		class: {
			name: 'lines'
		},
		attr: {
			size: 'data-lines-size'
		},

	}) {
		this.element = element;
		this.settings = settings;
		this.linesCount = 0;
		this.interval = null;
		this.attrSize = this.element.getAttribute(this.settings.attr.size);
		this.size = this.attrSize ? this.settings.layout[this.attrSize] : this.settings.layout['lg'];
		this.lines = [];
		this.inner = {};
		this.breakpoints = [];
		this.started = false;
		this.update = Date.now();
		
		this.inner._width  = document.body.offsetWidth;
		this.inner._height = document.body.offsetHeight;
		
		this.initBreakpoints();
		this.setPropsInner();
		

		this.createGrid();
		// this.startLines();

		window.addEventListener('resize', ()=>{
			// this.onResize();
		})

	}
	initBreakpoints() {
		for (let size of Object.keys(this.size)) {
			size = Number(size);
			if (size || size == 0) {
				this.breakpoints.push(size);
			}
		}
		
		this.eachBreakpoints();

	}

	setLineFields() {
		this._size = this.current.size;
		this._step = this.current.step;
		this._min = this.current.min;
		this._max = this.current.max;
		this._lines = this.current.lines;

		this._width = this.current.width ? this.current.width : this.element.offsetWidth;
		this._height = this.current.height ? this.current.height : this.element.offsetHeight;
	
	}

	eachBreakpoints() {
		if (this.breakpoints) {
			let currentPoint = null;

			for (let i = 0; i < this.breakpoints.length; i++) {
				let current = this.breakpoints[i],
						next = this.breakpoints[i + 1];

				if (next) {
					if (this.inner._width >= current && this.inner._width < next) {
						currentPoint = this.size[current];
					}
				} else {
					if (this.inner._width >= current) {
						currentPoint = this.size[current];
					}
				}
			}


			if (this.current != currentPoint) {
				this.current = currentPoint;
				this.setLineFields();
				return true;	
			} else {
				this.current = currentPoint
				this.setLineFields();
				return false;
			}
		}
	}
	rerenderGrid() {
		if (this.grid) {
			this.grid.remove();
			this.grid = null;

			this.createGrid();
		}
	}
	rerenderLines() {
		if (this.started) {
			this.stopLines();
			this.startLines();
		}
	}
	rerender() {
		this.rerenderGrid();
		this.rerenderLines();
	} 
	onResize() {
		let w = document.body.offsetWidth,
				h = document.body.offsetHeight;
		
		if (w > this.inner._width) {
			this.setPropsInner();
			let isChanged = this.eachBreakpoints();
			this.rerenderGrid();
			if (isChanged) {
				this.rerenderLines();
			}
		} else {
			this.setPropsInner();
			let isChanged = this.eachBreakpoints();
			if (isChanged) {
				this.rerender();
			}
		}
	}

	setPropsInner() {
		this.inner._width  = document.body.offsetWidth;
		this.inner._height = document.body.offsetHeight;

		this.inner.width  = this.roundDirection(this.inner._width, true);
		this.inner.height = this.roundDirection(this.inner._height, true);
	}
	stopLines() {
		this.started = false;
		clearInterval(this.interval);

		for(let i = 0; i < this.lines.length; i++) {
			let line = this.lines[i];
			line.line = null;
			line.canvas.remove();
			clearInterval(line.interval);
		}
		this.lines = [];
		this.linesCount = 0;
	}

	startLines() {
		
		this.started = true;
		this.interval = setInterval(()=>{
			if (this.linesCount <= this._lines) {
				let x = this.roundDirection(this.random(0, this.roundDirection(this._width, true))),
						y = this.roundDirection(this.random(0, this.roundDirection(this._height, true))),
						d = this.random(1, 8);

				this.createLine(x, y, {X: this.dispersion(d - this.settings.line.dispersion), Y: this.dispersion(d + this.settings.line.dispersion), default: d});
			}
		}, 1000);
	}
	createCanvas(name, styles) {
		let canvas = document.createElement('canvas');
		canvas.classList.add(this.settings.class.name + '__' + name);

		this.setDefaultStyles(canvas, styles);
		this.element.append(canvas);

		canvas.ctx = canvas.getContext('2d');
		return canvas;
	}

	setDefaultStyles(canvas, styles) {
		canvas.style.position = 'absolute';
		canvas.style.zIndex = styles.zIndex;
		canvas.setAttribute('width', styles.width);
		canvas.setAttribute('height', styles.height);
		canvas.style.top = 0;
		canvas.style.left = 50 + '%';
		canvas.style.transform = 'translateX(-50%)';
	}

	createLine(X, Y, direction) {
		let item = {};
		let canvas = this.createCanvas('line', {
			zIndex: -2,
			width: this._width,
			height: this._height
		});

		let line = {};
		line.X = X;
		line.Y = Y; 
		line.boxes    = this.random(this._min, this._max);
		line.length   = this._size / this._step * line.boxes;
		line.sizeMove = this._size / this._step;
		line.fadinEls = Math.ceil(line.length / 100 * this.settings.line.fadingPercent);
		line.fadeFrom = line.length - line.fadinEls;
		line.fadePercent = 100 / line.fadinEls;
		line.dashes   = [];
		line.move     = 1;
		line.moves    = [];
		line.opacityEls = 0;
		line.interval = null;

		item.canvas = canvas;
		item.line = line;

		this.linesCount++;
		this.lines.push(item)
			
		canvas.ctx.lineWidth = this.settings.line.stroke;

		for (let i = 0; i < line.length; i++) {
			let opacity = 1;
			if (i >= line.fadeFrom) {
				line.opacityEls++;
				opacity = (line.fadinEls - line.opacityEls) * line.fadePercent / 100;
			}
			line.dashes[i] = {
				xM: line.X,
				yM: line.Y,
				xL: line.X,
				yL: line.Y,
				opacity: opacity,
				coords: []
			}
		}

		line.draw = (i)=>{
			canvas.ctx.beginPath();
			canvas.ctx.strokeStyle = '#fff';
			canvas.ctx.globalAlpha = line.dashes[i].opacity;

			canvas.ctx.moveTo(line.dashes[i].xM, line.dashes[i].yM);
			canvas.ctx.lineTo(line.dashes[i].xL, line.dashes[i].yL);
			canvas.ctx.stroke();
			canvas.ctx.closePath();
		}

		let draw = ()=>{
			item.interval = line.interval = setInterval(()=>{
				canvas.ctx.clearRect(0,0, canvas.width, canvas.height);
				for (let i = 0; i < line.move && i < line.length; i++) {
					let dash = line.dashes[i],
							prevDash = line.dashes[i - 1];

					dash.coords[i + 1] = {
						xM: dash.xM,
						yM: dash.yM,
						xL: dash.xL,
						yL: dash.yL
					};

					

					if (prevDash) {
						dash.xM = prevDash.coords[i]["xM"];
						dash.yM = prevDash.coords[i]["yM"];
						dash.xL = prevDash.coords[i]["xL"];
						dash.yL = prevDash.coords[i]["yL"];
					}


					line.draw(i);

					if (i == 0) {
						let lastMove = line.moves[line.moves.length - 1];
						if (line.move % line.sizeMove == 0) {
							if (line.move < 4) {
								line.moves.push(line.lastMove = this.move(dash, this._step, direction.default));
							} else {	
								line.moves.push(line.lastMove = this.move(dash, this._step, direction.X, direction.Y));
							}
						} else {
							line.moves.push(line.lastMove = this.move(dash, this._step, lastMove));
						}	
						line.draw(i);
					}
				}


				line.move++;


				if (line.dashes[line.dashes.length - 1].xM <= 0 || line.dashes[line.dashes.length - 1].yM  <= 0 || line.dashes[line.dashes.length - 1].xM >= this.element.offsetWidth || line.dashes[line.dashes.length - 1].yM >= this.element.offsetHeight) {
					canvas.ctx.clearRect(0,0, canvas.width, canvas.height);
					
					clearInterval(line.interval);
					canvas.remove();
					this.linesCount--;


					setTimeout(()=>{
						line = null;
						canvas = null;
					}, 500)
					
				}
			}, 60)
		}



		window.requestAnimationFrame(draw)

		


	}

	createGrid() {
		let canvas;
		this.grid = canvas = this.createCanvas('bg', {
			zIndex: -5,
			width: this._width,
			height: this._height,
		});

		for (let x = 0; x <= this._width - 0; x += this.current.size) {
			for (let y = 0; y <= this._height - 0; y += this.current.size) {
				canvas.ctx.globalAlpha = this.settings.box.opacity;
				canvas.ctx.strokeStyle = this.settings.box.color;
				canvas.ctx.lineWidth = this.settings.box.stroke;

				canvas.ctx.beginPath();
				canvas.ctx.moveTo(x, y);
		    canvas.ctx.lineTo(x + this.current.size, y);
				canvas.ctx.stroke();
				canvas.ctx.closePath();

				canvas.ctx.beginPath();
				canvas.ctx.moveTo(x, y);
		    canvas.ctx.lineTo(x, y + this.current.size -1);
				canvas.ctx.stroke();
				canvas.ctx.closePath();


				canvas.ctx.globalAlpha = this.settings.x.opacity;
				canvas.ctx.strokeStyle = this.settings.x.color;
				canvas.ctx.lineWidth = this.settings.x.stroke;

				canvas.ctx.beginPath();
				canvas.ctx.moveTo(x + 2, y +2);
		    canvas.ctx.lineTo(x + this.current.size - 2, y + this.current.size - 2);
				canvas.ctx.stroke();
				canvas.ctx.closePath();

				canvas.ctx.beginPath();
				canvas.ctx.moveTo(x + this.current.size - 2, y + 2);
				canvas.ctx.lineTo(x + 2, y + this.current.size - 2);
				canvas.ctx.stroke();
				canvas.ctx.closePath();

				canvas.ctx.save();
			}
		}
	}

	move(dash, step, to, end) {
		let value = to && end ? this.random(to, end) : to;

		switch(value) {
			case 1:
				dash.xL = dash.xM;
				dash.xM = dash.xM;
				dash.yL = dash.yM;
				dash.yM -= step;
				break;
			case 2:
				dash.xL = dash.xM;
				dash.xM += step;
				dash.yL = dash.yM;
				dash.yM -= step;
				break;
			case 3:
				dash.xL = dash.xM;
				dash.xM += step;
				dash.yL = dash.yM;
				dash.yM = dash.yM;
				break;
			case 4:
				dash.xL = dash.xM;
				dash.xM += step;
				dash.yL = dash.yM;
				dash.yM += step;
				break;
			case 5:
				dash.xL = dash.xM;
				dash.xM = dash.xM;
				dash.yL = dash.yM;
				dash.yM += step;
				break;
			case 6:
				dash.xL = dash.xM;
				dash.xM -= step;
				dash.yL = dash.yM;
				dash.yM += step;
				break;
			case 7:
				dash.xL = dash.xM;
				dash.xM -= step;
				dash.yL = dash.yM;
				dash.yM = dash.yM;
				break;
			case 8:
				dash.xL = dash.xM;
				dash.xM -= step;
				dash.yL = dash.yM;
				dash.yM -= step;
				break;
		}

		return value;

	}
	dispersion(value) {
		if (value > 8) {
			return 8;
		} else if (value < 0) {
			return 0;
		} else {
			return value;
		}
	}

	roundDirection(value, plus) {
		if (plus) {
			return value - (value % this._size) + this.current.size;	
		} else {
			return value - (value % this._size);	
		}
		
	}
	random(min = 0, max = 1) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}