
export type SamplingTransform = (index: number, data: Float32Array) => number;

function InterpolateValue(index: number, array: Float32Array) {
    let lowIndex = Math.floor(index);
    let highIndex = Math.ceil(index);
    let lowValue = array[lowIndex];
    let highValue = array[highIndex];
    let scalingFactor = highIndex === lowIndex ? 0 : (index - lowIndex) / (highIndex - lowIndex);
    return lowValue + (highValue - lowValue) * scalingFactor;
}

function LinearToExponentialIndexing(val: number, min: number, max: number) {
    let percentageOfRange = (val - min) / (max - min);
    let rangeRatio = max / min;
    return min * Math.pow(rangeRatio, percentageOfRange);
}

function LinearToLogarithmicIndexing(val: number, min: number, max: number) {
    //A reflection of the exponential functional.
    return min * ((max - min) * (Math.log2(val) / Math.log2(max / min)) + min);
}

export function ExponentialSampling(index: number, data: Float32Array) {
    return InterpolateValue(LinearToExponentialIndexing(index, 1, data.length), data);
}

export function LinearSampling(index: number, data: Float32Array) {
    return data[index];
}

export class Animator extends EventTarget {
    private _cancellationToken: number = 0;
    public ZoomConstantY: number = 2;

    private _rangeOffset: number = 90;
    public get RangeOffset() {
        return this._rangeOffset;
    }
    public set RangeOffset(rangeOffset: number) {
        this._rangeOffset = rangeOffset;
        this.dispatchEvent(new Event('rangeOffsetChanged'));
    }

    constructor(private _canvas: HTMLCanvasElement, private _GetData: () => Float32Array) { 
        super();
    }

    private Draw(transform: SamplingTransform): void {
        let context = this._canvas.getContext('2d');
        if (context)
        {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            context.fillStyle = '#F90';
            let barWidth = this._canvas.width / data.length;
            for (let i = 1; i < data.length; i++)
            {
                let barHeight = (transform(i, data) + this.RangeOffset) * Math.pow(2, this.ZoomConstantY);
                let fillX = i * barWidth;
                let fillY = this._canvas.height - barHeight;               
                context.fillRect(fillX, fillY, barWidth, barHeight);
            }
        }
        this._cancellationToken = requestAnimationFrame(this.Draw.bind(this, transform));
    }

    public Start(transform: SamplingTransform): void {
        this.Stop();
        this.Draw(transform);
    }

    public Stop(): void {
        if (this._cancellationToken !== 0)
            cancelAnimationFrame(this._cancellationToken);
    }
}