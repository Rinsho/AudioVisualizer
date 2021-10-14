
export class Animator {
    private _cancellationToken: number = 0;
    public ZoomConstantX: number = 4;
    public ZoomConstantY: number = 2;

    constructor(private _canvas: HTMLCanvasElement, private _GetData: () => Float32Array) { }

    private LinearToLog(val: number, min: number, max: number) {
        let exp = (val - min) / (max - min);
        return min * Math.pow(max/min, this.ZoomConstantX * exp);
    }

    private InterpolateValue(index: number, array: Float32Array) {
        let lowIndex = Math.floor(index);
        let highIndex = Math.ceil(index);
        let lowValue = array[lowIndex];
        let highValue = array[highIndex];
        let scalingFactor = (index - lowIndex) / (highIndex - lowIndex);
        return lowValue + (highValue - lowValue) * scalingFactor;
    }

    private Draw(): void {
        let context = this._canvas.getContext('2d');
        if (context)
        {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            let barWidth = (this._canvas.width / data.length) * 2.5;
            for (let i = 1; i < data.length / this.ZoomConstantX; i++)
            { 
                let fillWidth = barWidth;
                //let fillHeight = data[i];
                let barHeight = 
                    this.InterpolateValue(this.LinearToLog(i, 1, data.length), data) 
                    * Math.pow(2, this.ZoomConstantY)
                    + 90
                    * Math.pow(2, this.ZoomConstantY);
                let fillX = i * barWidth;
                let fillY = this._canvas.height - barHeight;
                context.fillStyle = '#F90';
                context.fillRect(fillX, fillY, fillWidth, barHeight);
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