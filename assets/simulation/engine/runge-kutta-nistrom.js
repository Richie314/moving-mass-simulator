class RungeKuttaNistromEngine extends EngineBase
{
    
    /**
     * @param {Decimal|number} dt 
     * @param {string} name The name of the engine
     */
    constructor(dt, name = 'Runge-Kutta-Nistrom')
    {
        super(dt, name);
    }

    /**
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @param {Decimal} h
     * @returns {Vector3[]} the new y and yPrime to apply
    */ 
    rkn4Integration(tableMass, fallingMass, h)
    {
        //    Step 0: get initial values
        const yPrime0 = new Vector3(tableMass.rPrime, tableMass.thetaPrime, fallingMass.heightPrime);
        const y0 = new Vector3(tableMass.r, tableMass.theta, fallingMass.height);
        this.calculate_and_set_acc(tableMass, fallingMass);
        

        // Shorthands for later: it speeds the computation
        const hOver3 = h.div(3);
        const hOver8 = h.div(8);
        
        //    Step 1: t = t0 + h / 3

        //            .
        // k1 = f(y0, y0)
        const k1 = new Vector3(tableMass.rDoublePrime, tableMass.thetaDoublePrime, fallingMass.heightDoublePrime);
        //           .
        // y1 = y0 + y0 * h / 3 
        const y1 = y0.plus( yPrime0.times( hOver3 ) );
        // .    .
        // y1 = y0 + k1 * h / 3
        const yPrime1 = yPrime0.plus( k1.times( hOver3 ) );


        //    Step 2: t = t0 + 2 h / 3

        //            .
        // k2 = f(y1, y1)
        const k2 = this.calculateAccelerationsClone(tableMass, fallingMass, y1, yPrime1);
        //           .
        // y2 = y1 + y1 * h / 3 
        const y2 = y1.plus( yPrime1.times( hOver3 ) );
        // .    .
        // y2 = y1 + k2 * h / 3
        const yPrime2 = yPrime1.plus( k2.times( hOver3 ) );


        //    Step 3: t = t0 + h

        //            .
        // k3 = f(y2, y2)
        const k3 = this.calculateAccelerationsClone(tableMass, fallingMass, y2, yPrime2);
        //            .    .    .
        // y3 = y0 + (y0 - y1 + y2) * h
        const y3 = y0.plus( yPrime0.minus(yPrime1).plus(yPrime2).times(h) );
        // .    .
        // y3 = y0 + (k1 - k2 + k3) * h
        const yPrime3 = yPrime0.plus( k1.minus(k2).plus(k3).times(h) );

        
        //    Step 4: t = t0 + h
        //    It's a sort of weighted average of the values calculated before

        //            .
        // k4 = f(y3, y3)
        const k4 = this.calculateAccelerationsClone(tableMass, fallingMass, y3, yPrime3);
        //            .        .        .    .                  .         .     .     .
        // y4 = y0 + (y1 + 3 * y2 + 3 * y3 + y4) * h / 8 = y0 + (y1 + 3 * (y2 + y3) + y4) * h / 8
        const y4 = y0.plus( yPrime0.plus( yPrime1.plus(yPrime2).times(3) ).plus(yPrime3).times(hOver8) );
        // .    .                                          .
        // y4 = y0 + (k1 + 3 * k2 + 3 * k3 + k4) * h / 8 = y0 + (k1 + 3 * (k2 + k3) + k4) * h / 8
        const yPrime4 = yPrime0.plus( k1.plus( k2.plus(k3).times(3) ).plus(k4).times(hOver8) );


        // Return final values that will be applied to tableMass and fallingMass
        return [y4, yPrime4];
    }
    


    /*
    //Old version of the function, accumultaes error
    rkn4Integration(tableMass, fallingMass, h)
    {
        //Step 0
        const yPrime0 = new Vector3(tableMass.rPrime, tableMass.thetaPrime, fallingMass.heightPrime);
        const y0 = new Vector3(tableMass.r, tableMass.theta, fallingMass.height);
        
        this.calculate_and_set_acc(tableMass, fallingMass);
        const k1 = new Vector3(tableMass.rDoublePrime, tableMass.thetaDoublePrime, fallingMass.heightDoublePrime);

        // Shorthands for later
        const k1h = k1.times( h );
        const hOver6 = h.div(6);
        
        //    Step 1
        // .    .
        // y1 = y0 + k1 * h / 2
        const yPrime1 = yPrime0.plus( k1h.times(0.5) );
        //                .        .                                     .    .
        // y1 = y0 + (4 * y0 + 2 * y1 + k1 * h / 2) * h / 12 = y0 + (2 * y0 + y1 + k1 * h / 4) * h / 6 
        const y1 = y0.plus( 
            yPrime0.times(2).plus( yPrime1 ).plus( k1h.times(0.25) ).times( hOver6 ) 
        );
        //            .
        // k2 = f(y1, y1)
        const k2 = this.calculateAccelerationsClone(tableMass, fallingMass, y1, yPrime1);
        
        //    Step 2
        // .    .
        // y2 = y0 + k2 * h / 2
        const yPrime2 = yPrime0.plus( k2.times( h.div(2) ) );
        //                .        .
        // y2 = y0 + (4 * y0 + 2 * y2 + k1 * h / 2) * h / 12 = y0 + (2 * y0 + y2 + k1 * h / 4) * h / 6
        const y2 = y0.plus( 
            yPrime0.times(2).plus( yPrime2 ).plus( k1h.times(0.25) ).times( hOver6 ) 
        );
        //            .
        // k3 = f(y2, y2)
        const k3 = this.calculateAccelerationsClone(tableMass, fallingMass, y2, yPrime2);
        
        //    Step 3
        // .    .
        // y3 = y0 + k3 * h
        const yPrime3 = yPrime0.plus( k3.times( h ) );
        //                .        .
        // y2 = y0 + (4 * y0 + 2 * y3 + k1 * h) * h / 6
        const y3 = y0.plus( 
            yPrime0.times(4).plus( yPrime3.times(2) ).plus( k1h ).times( hOver6 ) 
        );
        //            .
        // k4 = f(y3, y3)
        const k4 = this.calculateAccelerationsClone(tableMass, fallingMass, y3, yPrime3);

        //    Retrieve final values
        // .    .
        // y4 = y0 + (k1 + 2 * k2 + 2* k3 + k4) * h / 6
        const yPrime4 = yPrime0.plus( k1.plus( k2.times(2) ).plus( k3.times(2) ).plus( k4 ).times( hOver6 ) );
        //            .        .        .    .
        // y4 = y0 + (y1 + 2 * y2 + 2 * y3 + y4) * h / 6
        const y4 = y0.plus( yPrime1.plus( yPrime2.times(2) ).plus( yPrime3.times(2) ).plus( yPrime4 ).times( hOver6 ) );


        //Return final values that will be applied to tableMass and fallingMass
        return [y4, yPrime4];
    }
    */

    /**
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @returns {boolean} true/false for success/error
     */
    executeSingleIteration(tableMass, fallingMass)
    {
        try {
            const [y, yPrime] = this.rkn4Integration(tableMass, fallingMass, this.dt);
            this.applyState(tableMass, fallingMass, y, yPrime);
            this.cleanData(tableMass, fallingMass);
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }
}

class RungeKuttaNistromEngine2 extends RungeKuttaNistromEngine
{
    /**
     * @param {Decimal|number} cableStartLength
     * @param {Decimal|number} dt 
     */
    constructor(cableStartLength, dt)
    {
        super(dt, 'Runge-Kutta-Nistrom - 2 variables');

        //Sanitize the inputs
        if (!Decimal.isDecimal(cableStartLength))
        {
            cableStartLength = new Decimal(cableStartLength);
        }
        this.cableStartLength = cableStartLength;
    }

    /**
     * Function that rebounds the state values of the objects
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    correctValues(tableMass, fallingMass)
    {
        //Prevent values from diverging: we set them both to the medium value
        tableMass.rPrime = fallingMass.heightPrime = ( tableMass.rPrime.plus(fallingMass.heightPrime) ).div(2);
        
        //Since cableLength = r + height, r + height - cableLength = error
        const diff = (tableMass.r.plus( fallingMass.height.abs() ).minus( this.cableLength ) ).div(2);
        tableMass.r = tableMass.r.minus( diff );
        fallingMass.height = fallingMass.height.plus( diff );
    }

    /**
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAccelerations(tableMass, fallingMass)
    {
        return this.calculateAcc2(tableMass, fallingMass);
    }
}

class RungeKuttaNistromEngine3 extends RungeKuttaNistromEngine
{
    /**
     * @param {Decimal|number} cableStartLength
     * @param {Decimal|number} k
     * @param {Decimal|number} dt 
     */
    constructor(cableStartLength, k, dt)
    {
        super(dt, 'Runge-Kutta-Nistrom - 3 variables');

        //Sanitize the inputs
        if (!Decimal.isDecimal(cableStartLength))
        {
            cableStartLength = new Decimal(cableStartLength);
        }
        this.cableStartLength = cableStartLength;

        if (!Decimal.isDecimal(k))
        {
            k = new Decimal(k);
        }
        this.k = k;
    }

    /**
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAccelerations(tableMass, fallingMass)
    {
        return this.calculateAcc3(tableMass, fallingMass);
    }

    /**
     * Just a shortcut for the spring energy
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Decimal}
     */
    SpringEnergy(tableMass, fallingMass)
    {
        const x = fallingMass.height.abs().plus(tableMass.r).minus(this.cableStartLength);
        return this.k.div(2).times(x.pow(2));
    }
}