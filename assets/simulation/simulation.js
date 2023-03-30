class Simulation
{
    /**
     * 
     * @param {Engine} engine 
     * @param {HTMLCanvasElement} topCanvas
     * @param {HTMLCanvasElement} sideCanvas
     * @param {Vector3} tableMeasures
     */
    constructor(engine, topCanvas, sideCanvas, tableMeasures)
    {
        this.Engine = engine;
        
        this.topCanvas = topCanvas;
        this.topCtx = this.topCanvas.getContext('2d');

        this.sideCanvas = sideCanvas;
        this.sideCtx = this.sideCanvas.getContext('2d');

        this.w = tableMeasures.x;
        this.h = tableMeasures.y;
        this.l = tableMeasures.z;
    }

    #drawTopView()
    {

    }

    #drawSideView()
    {

    }

    drawSimulation()
    {
        this.#drawTopView();
        this.#drawSideView();
    }

    executeIterations(num)
    {
        try {
            this.Engine.executeIterations(num);
        } catch (err) {
            warn(err);
            return false;
        }
        return true;
    }

    iterateAndDraw(num)
    {
        if (this.executeIterations(num))
        {
            this.drawSimulation();
        }
    }
}
