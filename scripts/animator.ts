
export class Animator {
    private _cancellationToken: number = 0;

    constructor(private _canvas: HTMLCanvasElement, private _GetData: () => Float32Array) { }

    private Draw(): void {
        let context = this._canvas.getContext('2d');
        if (context)
        {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            let barWidth = (this._canvas.width / data.length) * 2.5;
            for (let i = 1; i < data.length; i++)
            {
                let fillX = i * barWidth;
                let fillY = this._canvas.height - data[i];
                let fillWidth = barWidth;
                let fillHeight = this._canvas.height;
                context.fillStyle = '#F90';
                context.fillRect(fillX, fillY, fillWidth, fillHeight);
            }
        }
        this._cancellationToken = requestAnimationFrame(this.Draw);
    }

    public Start(): void {
        this.Draw();
    }

    public Stop(): void {
        if (this._cancellationToken !== 0)
            cancelAnimationFrame(this._cancellationToken);
    }
}