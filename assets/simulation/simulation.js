'use strict';

class Simulation
{
    /**
     * Builder
     * @param {Engine} engine The engine, can be changed later
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @param {HTMLCanvasElement|null} topCanvas The canvas where to draw the top view, can be null
     * @param {HTMLCanvasElement|null} sideCanvas The canvas where to draw the side view, can be null
     * @param {Vector3} tableMeasures How much the area to draw can be large
     * @param {number|Decimal|BigInt} dtCount How many physics iterations will be done during one graphical rendering and the other
     */
    constructor(engine, tableMass, fallingMass, topCanvas, sideCanvas, tableMeasures, dtCount)
    {
        //Sanitize input
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
        //Store objects
        this.Engine = engine;
        this.tableMass = tableMass;
        this.fallingMass = fallingMass;
        this.dtCount = dtCount;

        //Draw the tail or not in the 3d view
        this.drawTail = true;

        this.iterationCount = new Decimal(0);
        this.elapsedTime = new Decimal(0);

        this.RefreshCallback = () => { };
        
        this.tableStaticFrequencyValue = 0;
        this.tableStaticFrequencyMax = 10;

        //
        //    Canvas part
        //
        if (topCanvas == null || sideCanvas == null)
        {
            this.drawSimulation = () => {};
            return;
        }
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

    //Draw the top view
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

    //Draw the side view
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

    //Wrapper for both the drawTopView and drawSideView functions
    drawSimulation()
    {
        this.#drawTopView();
        this.#drawSideView();
    }

    /**
     * Executes num iterations
     * @param {Decimal|number} num 
     * @returns true/false for success/error
     */
    executeIterations(num)
    {
        try { //Catch any unexpected error
            
            if (!this.Engine.executeIterations(num, this.tableMass, this.fallingMass))
                return false; //An error was already caught but still happened

        } catch (err) {

            warn(err); //Log the unexpected error
            return false;
        }

        //All went good, we update the timestamps
        this.iterationCount = this.iterationCount.plus(num);
        this.elapsedTime = this.elapsedTime.plus(this.dt.times(num));
        return true;
    }

    /**
     * Executes num iterations, if no error occures draws the simulation 
     * on both the top and the side canvas
     * @param {Decimal|number} num 
     * @returns true/false for success/error
     */
    iterateAndDraw(num)
    {
        if (this.executeIterations(num))
        {
            this.drawSimulation();
            return true;
        }
        return false;
    }

    /**
     * Set the function to be called when the simulation refreshes
     * @param {Function} callback 
     * @returns true if the passed argument is valid, false otherwise
     */
    onRefresh(callback)
    {
        if (typeof callback !== 'function')
            return false;
        this.RefreshCallback = callback;
        return true;
    }

    //Call the previously set callback on refresh
    refresh()
    {
        try {
            this.RefreshCallback(this);
        } catch(err) {
            warn(err);
        } finally {
            //this.Engine.getNewAccelerations(tableMass, fallingMass);
            return this;
        }
    }

    /**
     * The dt of the Engine
     * @returns {Decimal}
     */
    get dt() {
        return this.Engine.dt;
    }

    /**
     * The dt of the Engine
     * @param {Decimal} value
     */
    set dt(value) {
        return this.Engine.dt = value;
    }

    /**
     * The cavalieriWeight of the Engine
     * @returns {Decimal}
     */
    get cavalieriWeight() {
        return this.Engine.cavalieriWeight;
    }

    /**
     * The cavalieriWeight of the Engine
     * @param {Decimal} value
     */
    set cavalieriWeight(value) {
        return this.Engine.cavalieriWeight = new Decimal(value);
    }

    /**
     * Changes the current engine, copying the actual values of masses and positions.
     * Executes a refresh
     * @param {Engine} newEngine The new engine
     * @returns {Simulation} this object
     */
    changeEngine(newEngine)
    {
        this.Engine = newEngine;
        return this.refresh();
    }

    /**
     * Set the function to be called when the simulation restarts
     * @param {Function} callback 
     * @returns true if the passed argument is valid, false otherwise
     */
    onRestart(callback)
    {
        if (typeof callback !== 'function')
        {
            return false;
        }
        this.RestartCallback = callback;
        return true;
    }

    //Restarts the simualtion
    restart()
    {
        this.iterationCount = new Decimal(0);
        this.elapsedTime = new Decimal(0);
        if (this.RestartCallback)
        {
            try {
                this.RestartCallback(this);
            } catch (err) {
                warn(err);
            }
        }
        this.refresh();
        log('Simulazione riavviata!');
    }

    /**
     * Alter spring on the fly
     * @param {Decimal|number|string} newK The new hooke's constant, N/m
     * @param {Decimal|number|string} newStartLength The new zero for spring energy, in meters
     */
    updateSpring(newK, newStartLength)
    {
        //Sanitize input
        if (!Decimal.isDecimal(newK))
        {
            newK = new Decimal(newK);
        }
        if (!Decimal.isDecimal(newStartLength))
        {
            newStartLength = new Decimal(newStartLength);
        }

        //Edit the spring only if there is one
        if ('k' in this.Engine)
        {
            this.Engine.k = newK;
        }
        if ('cableStartLength' in this.Engine)
        {
            this.Engine.cableStartLength = newStartLength;
        }
    }

    /**
     * @returns {Decimal} The spring constant, if present, 0 otherwise
     */
    get k()
    {
        if ('k' in this.Engine)
        {
            return this.Engine.k;
        }
        return new Decimal(0);
    }

    //Sets the spring constant, only if there is already one
    set k(val)
    {
        if ('k' in this.Engine)
        {
            //Sanitize
            if (!Decimal.isDecimal(val))
            {
                val = new Decimal(val);
            }
            this.Engine.k = val;
        }
    }

    /**
     * @returns {Decimal} The current total cable length, in meters
     */
    get cable()
    {
        return this.tableMass.r.plus( this.fallingMass.height.abs() );
    }

    /**
     * Returns true if we are hitting the counter for the trail plotting in the 3d view
     * @returns {boolean}
     */
    TableFrequency()
    {
        if (++this.tableStaticFrequencyValue >= this.tableStaticFrequencyMax)
        {
            this.tableStaticFrequencyValue = 0;
            return true;
        }
        return false;
    }
}
