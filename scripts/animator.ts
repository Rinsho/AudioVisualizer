
export class Animator extends EventTarget {
    private _cancellationToken: number = 0;
    public ZoomConstantX: number = 1;
    public ZoomConstantY: number = 2;

    private _domainSmoothing: number = 0;
    public get DomainSmoothing() {
        return this._domainSmoothing;
    }
    public set DomainSmoothing(domain: number) {
        this._domainSmoothing = domain;
        this.dispatchEvent(new Event('domainChanged'));
    }

    constructor(private _canvas: HTMLCanvasElement, private _GetData: () => Float32Array) { 
        super();
    }

    private LinearToExponentialIndexing(val: number, min: number, max: number) {
        let percentageOfRange = (val - min) / (max - min);
        let rangeRatio = max / min;
        return min * Math.pow(rangeRatio, percentageOfRange * this.ZoomConstantX);
    }

    private LinearToLogarithmicIndexing(val: number, min: number, max: number) {
        //A reflection of the exponential functional.
        return min * (((max - min) / this.ZoomConstantX) * (Math.log2(val) / Math.log2(max / min)) + min);
    }

    private InterpolateValue(index: number, array: Float32Array) {
        let lowIndex = Math.floor(index);
        let highIndex = Math.ceil(index);
        let lowValue = array[lowIndex];
        let highValue = array[highIndex];
        let scalingFactor = highIndex === lowIndex ? 0 : (index - lowIndex) / (highIndex - lowIndex);
        return lowValue + (highValue - lowValue) * scalingFactor;
    }

    private Draw(): void {
        let context = this._canvas.getContext('2d');
        if (context)
        {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            let barWidth = this._canvas.width / data.length;
            for (let i = 1; i < data.length / this.ZoomConstantX; i++)
            {
                //down-scaled linear sampling for testing
                //let barHeight = this.InterpolateValue((i * 2/3) + (1/3), data) * Math.pow(2, this.ZoomConstantY) + 90 * Math.pow(2, this.ZoomConstantY);

                let barHeight = 
                    (
                        this.InterpolateValue(
                            this.LinearToExponentialIndexing(i, 1, data.length), 
                            data
                        ) 
                        + 90
                    ) 
                    * Math.pow(2, this.ZoomConstantY);

                let fillX = i * barWidth;
                let fillY = this._canvas.height - barHeight;
                context.fillStyle = '#F90';
                context.fillRect(fillX, fillY, barWidth, barHeight);
            }
        }
        this._cancellationToken = requestAnimationFrame(this.Draw.bind(this));
    }

    public Start(): void {
        this.Draw();
    }

    public Stop(): void {
        if (this._cancellationToken !== 0)
            cancelAnimationFrame(this._cancellationToken);
    }
}