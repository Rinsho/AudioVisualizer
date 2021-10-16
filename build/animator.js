function InterpolateValue(index, array) {
    let lowIndex = Math.floor(index);
    let highIndex = Math.ceil(index);
    let lowValue = array[lowIndex];
    let highValue = array[highIndex];
    let scalingFactor = highIndex === lowIndex ? 0 : (index - lowIndex) / (highIndex - lowIndex);
    return lowValue + (highValue - lowValue) * scalingFactor;
}
function LinearToExponentialIndexing(val, min, max) {
    let percentageOfRange = (val - min) / (max - min);
    let rangeRatio = max / min;
    return min * Math.pow(rangeRatio, percentageOfRange);
}
function LinearToLogarithmicIndexing(val, min, max) {
    //A reflection of the exponential functional.
    return min * ((max - min) * (Math.log2(val) / Math.log2(max / min)) + min);
}
export function ExponentialSampling(index, data) {
    return InterpolateValue(LinearToExponentialIndexing(index, 1, data.length), data);
}
export function LinearSampling(index, data) {
    return data[index];
}
export class Animator extends EventTarget {
    constructor(_canvas, _GetData) {
        super();
        this._canvas = _canvas;
        this._GetData = _GetData;
        this._cancellationToken = 0;
        this.ZoomConstantY = 2;
        this._rangeOffset = 90;
    }
    get RangeOffset() {
        return this._rangeOffset;
    }
    set RangeOffset(rangeOffset) {
        this._rangeOffset = rangeOffset;
        this.dispatchEvent(new Event('rangeOffsetChanged'));
    }
    Draw(transform) {
        let context = this._canvas.getContext('2d');
        if (context) {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            context.fillStyle = '#F90';
            let barWidth = this._canvas.width / data.length;
            for (let i = 1; i < data.length; i++) {
                let barHeight = (transform(i, data) + this.RangeOffset) * Math.pow(2, this.ZoomConstantY);
                let fillX = i * barWidth;
                let fillY = this._canvas.height - barHeight;
                context.fillRect(fillX, fillY, barWidth, barHeight);
            }
        }
        this._cancellationToken = requestAnimationFrame(this.Draw.bind(this, transform));
    }
    Start(transform) {
        this.Stop();
        this.Draw(transform);
    }
    Stop() {
        if (this._cancellationToken !== 0)
            cancelAnimationFrame(this._cancellationToken);
    }
}
