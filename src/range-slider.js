class RangeSlider {

	constructor(elementContainer = {}, options = {}) {

		// validation of element, the only required argument
		if (!elementContainer || (elementContainer.nodeName !== 'DIV' && elementContainer.tagName !== 'DIV')) return;

		// contains the options for this slider
		this.options = {
			overlap: null,
			callbackFunction: null,
			min: null,
			max: null,
			start: null,
			end: null,
			step: null,
		};

		// handles this.options creation and options initialization
		this.init(options);

		// contain pub/sub listeners
		this.topics = {
			start: [],
			moving: [],
			stop: [],
		};

		// contains the DOM elements for the slider
		this.ui = {
			slider: null,
			handleLeft: null,
			handleRight: null,
			filledRail: null,
		};

		// slider element
		const sliderElem = document.createElement('div');
    sliderElem.className = 'range-slider';
		this.ui.slider = sliderElem;

		// rail element
		const rail = document.createElement('div');
		rail.className = 'range-slider__rail';
		this.ui.rail = rail;
		this.ui.slider.appendChild(this.ui.rail);

		// left handle
		const handleLeft = document.createElement('div');
		handleLeft.className = 'range-slider__handle range-slider__handle--left';
		this.ui.handleLeft = handleLeft;
		this.ui.slider.appendChild(this.ui.handleLeft);

		// right handle
		const handleRight = document.createElement('div');
		handleRight.className = 'range-slider__handle range-slider__handle--right';
		this.ui.handleRight = handleRight;
		this.ui.slider.appendChild(this.ui.handleRight);

		// filled rill element
		const filledRail = document.createElement('div');
		filledRail.className = 'range-slider__filled-rail';
		this.ui.filledRail = filledRail;
		this.ui.slider.appendChild(this.ui.filledRail);

		elementContainer.appendChild(this.ui.slider);


		// move handles to have it's center as the end pointer point -> babakfp
		this.ui.handleLeft.style.marginLeft = '-' + (handleLeft.offsetWidth / 2) + 'px';
		this.ui.handleLeft.style.left = '0';
		this.ui.handleRight.style.marginRight = '-' + (handleRight.offsetWidth / 2) + 'px';
		this.ui.handleRight.style.right = '0';


		// push elements to starting positions
		const data = {
			left: this.options.start,
			right: this.options.end,
		};
		this.move.bind(this)(data, true);

		// bind events to start listening
		this.startingHandler = this.starting.bind(this);
		this.ui.handleLeft.onmousedown = this.startingHandler;
		this.ui.handleLeft.ontouchstart = this.startingHandler;
		this.ui.handleRight.onmousedown = this.startingHandler;
		this.ui.handleRight.ontouchstart = this.startingHandler;
	}

	/* default config
	 * overlap (boolean denotes if handles will overlap or just sit next to each other)
	 */
	get defaultOptions() {
		return {
			overlap: false,
			callbackFunction: null,
			min: 0,
			max: 100,
		};
	}

	/* helper method (replace with shared function from library) */
	extend(defaults = {}, options = {}) {
		const extended = {};
		let prop;

		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}

		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}

		return extended;
	}

	// initialize options and browser sniffing
	init(options = {}) {
		// extend default options
		if (typeof options === 'object') {
			this.options = this.extend(this.defaultOptions, options);
		} else {
			this.options = this.defaultOptions;
		}

		// default start/end
		this.options.start = this.options.start || this.options.min;
		this.options.end = this.options.end || this.options.max;


		this.options.max = parseFloat(this.options.max);
		this.options.min = parseFloat(this.options.min);

		// check if max and min are proper
		if (this.options.max < this.options.min) {
			this.options.min = this.options.max;
		}

		// check if start and end are within bounds
		if (typeof this.options.start !== 'undefined' &&
			typeof this.options.end !== 'undefined' &&
			this.options.start <= this.options.end &&
			this.options.start >= this.options.min &&
			this.options.end <= this.options.max) {
			this.options.start = parseFloat(this.options.start);
			this.options.end = parseFloat(this.options.end);

		} else {

			this.options.start = this.options.min;
			this.options.end = this.options.max;
		}


	}

	/* provide information about the slider value
	 * returns an object with property left and right denoting left and right values */
	getInfo() {
		let info = {};
		const total = this.options.max - this.options.min;
		const left = this.ui.filledRail.style.left ? parseFloat(this.ui.filledRail.style.left.replace('%', '')) : 0;
		const right = this.ui.filledRail.style.right ? parseFloat(this.ui.filledRail.style.right.replace('%', '')) : 0;


		info = {
			left: this.options.min + (left / 100) * total,
			right: this.options.max - (right / 100) * total,
		};


		if (typeof this.options.callbackFunction === 'function') {
			info.left = this._applyCallback_(info.left, this.options.callbackFunction);
			info.right = this._applyCallback_(info.right, this.options.callbackFunction);
		}

		return info;
	}

	// apply call back using data provided
	_applyCallback_(data = null, callback = null) {
		try {
			if (!callback) return null;

			return callback.call(undefined, data);

		} catch (error) {

			throw error;

		}
	}

	/* when handle is pressed
	 * attach all the necessary event handlers */
	starting(event = null) {

		if (!event) return;

		// exit if disabled
		if (this.isDisabled) return;

		let x = 0;
		let y = 0;

		// initialize drag object
		this.dragObj = {};

		// get handle element node not the child nodes
		// if this is a child of the parent try to find the handle element
		this.dragObj.elNode = event.target;

		while (!this.dragObj.elNode.classList.contains('range-slider__handle')) {
			this.dragObj.elNode = this.dragObj.elNode.parentNode;
		}

		// direction where the slider control is going
		this.dragObj.dir = this.dragObj.elNode.classList.contains('range-slider__handle--left') ? 'left' : 'right';

		// get cursor position wrt the page
		// if touch screen (event.touches) and if ie11 (pagexoffset)
		x = (typeof event.clientX !== 'undefined' ? event.clientX :
			event.touches[0].pageX) + (window.scrollX || window.pageXOffset);
		y = (typeof event.clientY !== 'undefined' ? event.clientY :
			event.touches[0].pageY) + (window.scrollY || window.pageYOffset);

		// save starting positions of cursor and element
		this.dragObj.cursorStartX = x;
		this.dragObj.cursorStartY = y;
		this.dragObj.elStartLeft = parseFloat(this.dragObj.elNode.style.left);
		this.dragObj.elStartRight = parseFloat(this.dragObj.elNode.style.right);
		if (isNaN(this.dragObj.elStartLeft)) this.dragObj.elStartLeft = 0;
		if (isNaN(this.dragObj.elStartRight)) this.dragObj.elStartRight = 0;

		// update element's positioning for z-index
		// the element last moved will have a higher positioning
		this.ui.handleLeft.classList.remove('range-slider__handle--active');
		this.ui.handleRight.classList.remove('range-slider__handle--active');
		this.dragObj.elNode.classList.add('range-slider__handle--active');

		// capture mousemove and mouseup events on the page
		this.movingHandler = this.moving.bind(this);
		this.stopHandler = this.stop.bind(this);
		document.addEventListener('mousemove', this.movingHandler, true);
		document.addEventListener('mouseup', this.stopHandler, true);
		document.addEventListener('touchmove', this.movingHandler, true);
		document.addEventListener('touchend', this.stopHandler, true);

		// stop default events
		this.stopDefault.bind(this)(event);
		this.ui.filledRail.classList.remove('slider-transition');
		this.ui.handleLeft.classList.remove('slider-transition');
		this.ui.handleRight.classList.remove('slider-transition');

		// pub/sub lifecycle - start
		this.publish('start', this.getInfo());
	}

	/* when handle is being moved */
	moving(event) {
		// get cursor position with respect to the page
		const x = (typeof event.clientX !== 'undefined' ? event.clientX :
			event.touches[0].pageX) + (window.scrollX || window.pageXOffset);


		// move drag element by the same amount the cursor has moved
		const sliderWidth = this.ui.slider.offsetWidth;
		let calculatedVal = 0;
		if (this.dragObj.dir === 'left') {
			calculatedVal = this.dragObj.elStartLeft + ((x - this.dragObj.cursorStartX) / sliderWidth * 100);
		} else if (this.dragObj.dir === 'right') {
			calculatedVal = this.dragObj.elStartRight + ((this.dragObj.cursorStartX - x) / sliderWidth * 100);
		}

		// keep handles within range
		if (calculatedVal < 0) {
			calculatedVal = 0;
		} else if (calculatedVal > 100) {
			calculatedVal = 100;
		}

		// sanitize to work for both directions
		// since we are adding to left and right there should not be a negative number
		calculatedVal = Math.abs(calculatedVal);

		// take into account the handle when calculating space left
		let handleOffset = 0;
		if (!this.options.overlap) {
			handleOffset = (this.ui.handleRight.offsetWidth / this.ui.slider.offsetWidth) * 100;
		}

		// add movement based on handle direction
		let remaining = 0;
		if (this.dragObj.dir === 'left') {
			remaining = (100 - handleOffset) - this.ui.filledRail.style.right.replace('%', '');
			if (remaining <= calculatedVal) {
				calculatedVal = remaining;
			}

			this.dragObj.elNode.style.left = calculatedVal + '%';
			this.ui.filledRail.style.left = calculatedVal + '%';
		} else {
			remaining = (100 - handleOffset) - this.ui.filledRail.style.left.replace('%', '');
			if (remaining <= calculatedVal) {
				calculatedVal = remaining;
			}

			this.dragObj.elNode.style.right = calculatedVal + '%';
			this.ui.filledRail.style.right = calculatedVal + '%';
		}

		// stop default events
		this.stopDefault.bind(this)(event);

		// pub/sub lifecycle - moving
		this.publish('moving', this.getInfo());
	}

	/* when handle is blured - do clean up */
	stop(event) {
		// stop capturing mousemove and mouseup events
		document.removeEventListener('mousemove', this.movingHandler, true);
		document.removeEventListener('mouseup', this.stopHandler, true);
		document.removeEventListener('touchmove', this.movingHandler, true);
		document.removeEventListener('touchend', this.stopHandler, true);

		// stop default events
		this.stopDefault.bind(this)(event);

		// pub/sub lifecycle - stop
		this.publish('stop', this.getInfo());
	}

	/* push elements to position based on data */
	move(data, preventPublish) {
		let importedData = data;

		// transition effects (cleaned up at rangeslider.prototype.starting);
		this.ui.filledRail.classList.add('slider-transition');
		this.ui.handleLeft.classList.add('slider-transition');
		this.ui.handleRight.classList.add('slider-transition');

		const total = this.options.max - this.options.min;

		if (typeof importedData === 'object') {

			if (importedData.left) {

				if (importedData.left < this.options.min) importedData.left = this.options.min;
				if (importedData.left > this.options.max) importedData.left = this.options.max;

				const posLeft = (importedData.left - this.options.min) / total * 100;
				this.ui.handleLeft.style.left = posLeft + '%';
				this.ui.filledRail.style.left = posLeft + '%';
			}

			if (importedData.right) {
				if (importedData.right < this.options.min) importedData.right = this.options.min;
				if (importedData.right > this.options.max) importedData.right = this.options.max;

				const posRight = (this.options.max - importedData.right) / total * 100;
				this.ui.handleRight.style.right = posRight + '%';
				this.ui.filledRail.style.right = posRight + '%';
			}

			// if overlap is not enabled then check if the starting positions are overlapping - reset to full
			if (!this.options.overlap && this.ui.handleLeft.offsetLeft + this.ui.handleLeft.offsetWidth >
				this.ui.handleRight.offsetLeft - 1) {
				this.ui.filledRail.style.left = '0%';
				this.ui.filledRail.style.right = '0%';
				this.ui.handleLeft.style.left = '0%';
				this.ui.handleRight.style.right = '0%';
			}

		} else if (!isNaN(importedData)) {

			if (importedData < this.options.min) importedData = this.options.min;
			if (importedData > this.options.max) importedData = this.options.max;

			const pos = (importedData - this.options.min) / total * 100;
			this.ui.handleLeft.style.left = pos + '%';
			this.ui.filledRail.style.left = '0%';
			this.ui.filledRail.style.right = (100 - pos) + '%';
		}

		// pub/sub lifecycle - moving
		if (!preventPublish) {
			this.publish('moving', this.getInfo());
		}
	}

	/* utility function to stop default events */
	stopDefault(event = null) {
		if (!event) return;

		event.preventDefault();
	}

	/* accessor for disable property */
	disable(boolean) {
		this.isDisabled = boolean;
		if (this.isDisabled) {
			this.ui.slider.classList.add('slider-disabled');
		} else {
			this.ui.slider.classList.remove('slider-disabled');
		}
	}

	/* subscribe hook
	 * topic - keyword (start, moving, end)
	 * listener - function that will be called when topic is fired with argument of getinfo() data
	 */
	subscribe(topic = null, listener = null) {

		if (!topic || !listener) return {};

		// check validity of topic and listener
		if (!this.topics.hasOwnProperty.call(this.topics, topic) ||
			typeof topic !== 'string' ||
			typeof listener !== 'function') return {};

		// add the listener to queue
		// retrieve the index for deletion
		const index = this.topics[topic].push(listener) - 1;

		// return instance of the subscription for deletion
		return {
			remove: (function() {
				delete this.topics[topic][index];
			}).bind(this),
		};
	}

	/* publish hook
	 * topic - keyword (start, moving, end)
	 * data - getinfo() result to pass into the listener
	 */
	publish(topic = null, data = null) {

		if (!topic || !data) return;

		// check validity of topic
		if (!this.topics.hasOwnProperty.call(this.topics, topic) || typeof topic !== 'string') return;

		// cycle through events in the queue and fire them with the slider data
		this.topics[topic].forEach(function(event) {
			event(data);
		});

	}

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = RangeSlider;
} else {
	window.RangeSlider = RangeSlider;
}