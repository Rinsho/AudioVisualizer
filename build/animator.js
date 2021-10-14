export class Animator {
    constructor(_canvas, _GetData) {
        this._canvas = _canvas;
        this._GetData = _GetData;
        this._cancellationToken = 0;
        this.ZoomConstantX = 4;
        this.ZoomConstantY = 2;
    }
    LinearToLog(val, min, max) {
        let exp = (val - min) / (max - min);
        return min * Math.pow(max / min, this.ZoomConstantX * exp);
    }
    InterpolateValue(index, array) {
        let lowIndex = Math.floor(index);
        let highIndex = Math.ceil(index);
        let lowValue = array[lowIndex];
        let highValue = array[highIndex];
        let scalingFactor = (index - lowIndex) / (highIndex - lowIndex);
        return lowValue + (highValue - lowValue) * scalingFactor;
    }
    Draw() {
        let context = this._canvas.getContext('2d');
        if (context) {
            let data = this._GetData();
            context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            let barWidth = (this._canvas.width / data.length) * 2.5;
            for (let i = 1; i < data.length / this.ZoomConstantX; i++) {
                let fillWidth = barWidth;
                //let fillHeight = data[i];
                let barHeight = this.InterpolateValue(this.LinearToLog(i, 1, data.length), data)
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
    Start() {
        this.Draw();
    }
    Stop() {
        if (this._cancellationToken !== 0)
            cancelAnimationFrame(this._cancellationToken);
    }
}
