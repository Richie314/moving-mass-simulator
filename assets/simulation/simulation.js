'use strict';

class Simulation
{
    /**
     * @param {Engine} engine 
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @param {HTMLCanvasElement} topCanvas
     * @param {HTMLCanvasElement} sideCanvas
     * @param {Vector3} tableMeasures
     * @param {number|Decimal|BigInt} dtCount
     */
    constructor(engine, tableMass, fallingMass, topCanvas, sideCanvas, tableMeasures, dtCount)
    {
        if (!(tableMass instanceof MassRotatingObject))
        {
            throw new Error('Invalid parameter "tableMass"');
        }
        if (!(fallingMass instanceof MassFallingObject))
        {
            throw new Error('Invalid parameter "fallingMass"');
        }
        if (!Decimal.isDecimal(dtCount) && typeof dtCount !== 'number' && !(dtCount instanceof BigInt))
        {
            throw new Error('Invalid parameter "dtCount"');
        }
        this.Engine = engine;
        this.tableMass = tableMass;
        this.fallingMass = fallingMass;
        this.dtCount = dtCount;

        this.topCanvas = topCanvas;
        this.topCtx = this.topCanvas.getContext('2d');

        this.sideCanvas = sideCanvas;
        this.sideCtx = this.sideCanvas.getContext('2d');

        this.w = tableMeasures.x;
        this.l = tableMeasures.y;
        this.h = tableMeasures.z;

        this.topCanvasDrawOffSet = {
            x: this.topCanvas.width / 2,
            y: this.topCanvas.height / 2,
        };
        this.topCanvasScaleX = this.topCanvas.width / this.w.toNumber();
        this.topCanvasScaleY = this.topCanvas.height / this.l.toNumber();
        this.topCanvasZero = {
            x: this.#getTopCanvasCoordX(0),
            y: this.#getTopCanvasCoordY(0)
        };
        this.topCanvasDiscRadius = 30;

        this.sideCanvasDrawOffSet = {
            x: this.sideCanvas.width / 2,
            y: 10,
        };
        this.sideCanvasScaleX = this.sideCanvas.width / this.l.toNumber();
        this.sideCanvasScaleY = (this.sideCanvas.height - 10) / this.h.toNumber();
        this.sideCanvasZero = {
            x: this.#getSideCanvasCoordX(0),
            y: this.#getSideCanvasCoordY(0)
        };


        this.TwoPi = 2 * Math.PI;

        this.RefreshCallback = () => { };
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} r 
     * @param {number} x 
     * @param {number} y 
     * @param {string} color 
     */
    #drawCircle(ctx, r, x, y, color)
    {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, this.TwoPi);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} p1x 
     * @param {number} p1y
     * @param {number} p2x 
     * @param {number} p2y 
     * @param {string} color 
     */
    #drawLine(ctx, p1x, p1y, p2x, p2y, color = '#000000')
    {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineWidth = 4;
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
        ctx.closePath();
    }
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y
     * @param {number} r 
     * @param {number} start
     * @param {number} end 
     * @param {string} color
     */
    #drawArc(ctx, x, y, r, start, end, color = '#000000')
    {
        ctx.strokeStyle = color;
        ctx.beginPath();
        this.topCtx.arc(x, y, r, -end, start, false);
        ctx.stroke();
        ctx.closePath();
    }

    #drawTopView()
    {
        //Draws something like this
        /*****************************************
         *          _                            *
         *         / \                           *
         *        |   |                          *
         *         \ / \                         *
         *          -    \                       *
         *                 \                     *
         *                   \                   *
         *                    0                  * 
         *                                       *
         *                                       *
         *                                       *
         *                                       *
         *                                       *
         ****************************************/
        this.topCtx.fillStyle = '#ffffff';
        this.topCtx.clearRect(0, 0, this.topCanvas.width, this.topCanvas.height);
        this.#drawCircle(this.topCtx, 4, 
            this.topCanvasZero.x, this.topCanvasZero.y, '#000000');
        const massPos = this.tableMass.position.toVec3().toNumbers();
        const canvasPos = {
            x: this.#getTopCanvasCoordX(massPos.x),
            y: this.#getTopCanvasCoordY(massPos.y)
        }

        this.#drawLine(//X axis
            this.topCtx, 
            0, this.topCanvasZero.y,
            this.topCanvas.width, this.topCanvasZero.y);
        this.#drawLine(
            this.topCtx, 
            this.topCanvas.width, this.topCanvasZero.y,
            this.topCanvas.width - 30, this.topCanvasZero.y - 30);
        this.#drawLine(
            this.topCtx, 
            this.topCanvas.width, this.topCanvasZero.y,
            this.topCanvas.width - 30, this.topCanvasZero.y + 30);
        this.topCtx.font = "40px Arial";
        this.topCtx.fillStyle = '#000000';
        this.topCtx.fillText('X', this.topCanvas.width - 30, this.topCanvasZero.y - 35, 30);

        this.#drawLine(//Y axis
            this.topCtx, 
            this.topCanvasZero.x, 0,
            this.topCanvasZero.x, this.topCanvas.height);
        this.#drawLine(
            this.topCtx, 
            this.topCanvasZero.x, 0,
            this.topCanvasZero.x - 30, 30);
        this.#drawLine(
            this.topCtx, 
            this.topCanvasZero.x, 0,
            this.topCanvasZero.x + 30, 30);
        this.topCtx.fillText('Y', this.topCanvasZero.x - 60, 35, 30);

        this.#drawLine(
            this.topCtx, 
            this.topCanvasZero.x, this.topCanvasZero.y,
            canvasPos.x, canvasPos.y, '#0000ff');
        this.#drawArc(
            this.topCtx,
            this.topCanvasZero.x, this.topCanvasZero.y, 
            35, 0, this.tableMass.position.theta.toNumber(),
            '#ffa500');
        this.#drawCircle(
            this.topCtx, 
            this.topCanvasDiscRadius, 
            canvasPos.x, 
            canvasPos.y,
            '#ff0000');
    }
    #getTopCanvasCoordX(simulationX)
    {
        return this.topCanvasDrawOffSet.x + simulationX * this.topCanvasScaleX;
    }
    #getTopCanvasCoordY(simulationY)
    {
        return this.topCanvasDrawOffSet.y - simulationY * this.topCanvasScaleY;
    }
    #drawSideView()
    {
        //Draws something like this
        /**************************************
         *####################################*
         *                |                   *
         *                |                   *
         *                |                   *
         *                |                   *
         *                |                   *
         *               / \                  *
         *              |   |                 * 
         *               \ /                  *
         *                                    *
         *                                    *
         *                                    *
         *                                    *
         **************************************/
        this.sideCtx.fillStyle = '#ffffff';
        this.sideCtx.clearRect(0, 0, this.sideCanvas.width, this.sideCanvas.height);
        const massPos = this.fallingMass.position.toNumbers();
        const canvasPos = {
            x: this.#getSideCanvasCoordX(massPos.y),
            y: this.#getSideCanvasCoordY(massPos.z)
        }

        this.#drawLine(
            this.sideCtx, 
            this.sideCanvasZero.x, this.sideCanvasZero.y, 
            canvasPos.x, canvasPos.y, '#0000ff');
        this.#drawCircle(
            this.sideCtx, 
            25, 
            canvasPos.x, canvasPos.y, 
            '#00ff00');

        this.sideCtx.fillStyle = '#62CDFF';
        this.sideCtx.fillRect(0, 0, this.sideCanvas.width, this.sideCanvasDrawOffSet.y);
    }
    #getSideCanvasCoordX(simulationY)
    {
        return this.sideCanvasDrawOffSet.x + simulationY * this.sideCanvasScaleX;
    }
    #getSideCanvasCoordY(simulationZ)
    {
        return this.sideCanvasDrawOffSet.y - simulationZ * this.sideCanvasScaleY;
    }

    drawSimulation()
    {
        this.#drawTopView();
        this.#drawSideView();
    }

    executeIterations(num)
    {
        try {
            if (!this.Engine.executeIterations(num, this.tableMass, this.fallingMass))
                return false;
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
            return true;
        }
        return false;
    }
    onRefresh(callback)
    {
        if (typeof callback !== 'function')
            return false;
        this.RefreshCallback = callback;
        return true;
    }
    refresh()
    {
        try {
            this.RefreshCallback(this);
        } catch(err) {
            warn(err);
        } finally {
            return this;
        }
    }

    /**
     * @returns {Decimal}
     */
    get dt() {
        return this.Engine.dt;
    }
    /**
     * @param {Decimal} value
     */
    set dt(value) {
        return this.Engine.dt = value;
    }

    /**
     * Changes the current engine, copying the actual values of masses and positions
     * @param {Engine} newEngine The new engine
     * @returns {Simulation} this object
     */
    changeEngine(newEngine)
    {
        this.Engine = newEngine;
        return this.refresh();
    }

    restart()
    {
        //TODO: Add code

        return this.refresh();
    }

    updateSpring(newK, newStartLength)
    {
        if (!Decimal.isDecimal(newK))
        {
            newK = new Decimal(newK);
        }
        if (!Decimal.isDecimal(newStartLength))
        {
            newStartLength = new Decimal(newStartLength);
        }
        if ('k' in this.Engine)
        {
            this.Engine.k = newK;
        }
        if ('cableStartLength' in this.Engine)
        {
            this.Engine.cableStartLength = newStartLength;
        }
    }
    
}
