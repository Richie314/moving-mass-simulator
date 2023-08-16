'use strict';

//Wrapper for static physics functions
class EngineHelpers
{

    /********************************************
     * 
     *         Apply impulse to corpse
     *    (increase/decrease its momentum)
     * 
    ********************************************/

    /**
     * @param {MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} impulse 
     */
    #applyImpulseRotating(corpse, impulse)
    {
        if (impulse instanceof PolarVector)
        {
            return corpse.speed.add(impulse.mult((new Decimal(1)).div(corpse.mass)));
        }

        throw new Error('impulse was not a PolarVector');
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {Vector3} impulse 
     */
    #applyImpulseFalling(corpse, impulse)
    {
        return corpse.speed.add(impulse.times((new Decimal(1)).div(corpse.mass)));
    }

    /**
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} impulse 
     * @returns {Vector3|PolarVector}
     */
    applyImpulse(corpse, impulse)
    {
        if (corpse instanceof MassFallingObject)
        {
            return this.#applyImpulseFalling(corpse, impulse);
        }

        if (corpse instanceof MassRotatingObject)
        {
            return this.#applyImpulseRotating(corpse, impulse);
        }

        throw new Error('corpse was not of a valid type!');
    }

    
    applyForce(corpse, force, duration)
    {
        return this.applyImpulse(corpse, force.times(duration));
    }

    /********************************************
     * 
     *       Apply acceleration to corpse
     *          (speed it up or down)
     * 
    ********************************************/

    /**
     * @param {MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} speedVariation 
     */
    #applyAccelerationRotating(corpse, speedVariation)
    {
        if (speedVariation instanceof PolarVector)
        {
            return corpse.speed.add(speedVariation);
        }

        throw new Error('speedVariation was not a PolarVector');
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {Vector3} speedVariation
     */
    #applyAccelerationFalling(corpse, speedVariation)
    {
        return corpse.speed.add(speedVariation);
    }

    /**
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} acc 
     * @param {Decimal|number} duration 
     */
    applyAcceleration(corpse, acc, duration)
    {
        if (corpse instanceof MassFallingObject)
        {
            return this.#applyAccelerationFalling(corpse, acc.times(duration));
        }

        if (corpse instanceof MassRotatingObject)
        {
            return this.#applyAccelerationRotating(corpse, acc.times(duration));
        }

        throw new Error('corpse was not of a valid type');
    }

    
    /********************************************
     * 
     *           Apply speed to corpse
     *               (move it)
     * 
    ********************************************/

    /**
     * @param {MassFallingObject} corpse 
     * @param {Vector3} acc 
     * @param {Vector3} speed 
     * @param {number|Decimal} duration 
     * @param {number |Decimal} cavalieriWeight
     */
    #applySpeedFalling(corpse, acc, speed, duration, cavalieriWeight)
    {
        const vDeltaT = speed.times(duration);
        const halfAccDeltaTSquare = acc.times(0.5).times(duration.pow(2)).times( cavalieriWeight );
        return corpse.position.add( halfAccDeltaTSquare.plus( vDeltaT ) );
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {PolarVector} acc
     * @param {PolarVector} speed 
     * @param {number|Decimal} duration 
     * @param {number |Decimal} cavalieriWeight
     */
    #applySpeedRotating(corpse, acc, speed, duration, cavalieriWeight)
    {
        const vDeltaT = speed.times(duration);
        const halfAccDeltaTSquare = acc.times(0.5).times(duration.pow(2)).times( cavalieriWeight );
        return corpse.position.add( halfAccDeltaTSquare.plus( vDeltaT ) );
    }

    /**
     * Function of numeric integration for the speeds
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} acc
     * @param {Vector3|PolarVector} speed
     * @param {Decimal|number} duration 
     * @param {number |Decimal} cavalieriWeight
     */
    applySpeed(corpse, acc, speed, duration, cavalieriWeight = 0.3)
    {
        
        if (corpse instanceof MassFallingObject)
        {
            return this.#applySpeedFalling(corpse, acc, speed, duration, cavalieriWeight);
        }

        if (corpse instanceof MassRotatingObject)
        {
            return this.#applySpeedRotating(corpse, acc, speed, duration, cavalieriWeight);
        }

        throw new Error('corpse was not of a valid type!');
    }

}
class EngineBase extends EngineHelpers
{
    /**
     * @param {Decimal|number} dt
     * @param {string} name The name of the engine
     */
    constructor (dt, name)
    {
        super();
        this.dt = new Decimal(dt);
        this.name = String(name);
    }

    #inverteTimeFlow()
    {
        this.dt = this.dt.neg();
    }
    /**
     * Executes num iterations, stops in case of error
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @param {number} num Integer (can be negtive)
     * @returns {boolean} true/false for success/error
     */
    executeIterations(num, tableMass, fallingMass)
    {
        const numAbs = Math.abs(num);
        let ret = true;

        //Inverts the dt interval if we are requesting a backwards iteration
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }

        //Actual iteration
        for (let i = 0; i < numAbs && ret; i++)
        {
            ret = this.executeSingleIteration(tableMass, fallingMass);
        }

        
        //Set the direction to forward if it was previously altered
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }

        //true/false for success/error
        return ret;
    }

    /**
     * 
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Vector3} y 
     * @param {Vector3} yPrime 
     */
    calculateAccelerationsClone(tableMass, fallingMass, y, yPrime)
    {
        //Create a copy of the main objects to not alter them yet
        const tableClone = tableMass.clone();
        const fallingClone = fallingMass.clone();

        this.applyState(tableClone, fallingClone, y, yPrime);

        //We use the original function now
        return this.calculateAccelerations(tableClone, fallingClone);
    }
    
    /**
     * 
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Vector3} y 
     * @param {Vector3} yPrime 
     */
    applyState(tableMass, fallingMass, y, yPrime)
    {
        //Apply new state values
        tableMass.r = y.x;
        tableMass.theta = y.y;
        fallingMass.height = y.z;

        //Apply new speed values
        tableMass.rPrime = yPrime.x;
        tableMass.thetaPrime = yPrime.y;
        fallingMass.heightPrime = yPrime.z;
    }

    /**
     * Tries to correct errors if found, stops the simulation in case of collisions
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    cleanData(tableMass, fallingMass)
    {
        //For better output
        tableMass.position.reboundAngle();

        //Check for failure
        if (fallingMass.height.greaterThan(0))
        {
            throw new Error('Simulazione incoerente, collisione avvenuta');
        }

        //Check for center crossing
        if (tableMass.r.lessThanOrEqualTo(0))
        {
            //The object just crossed the center of the table
            //A reflection happens
            tableMass.position.reboundPositive();
            tableMass.rPrime = tableMass.rPrime.neg();
            ///////TODO: fix this
            fallingMass.heightPrime = fallingMass.heightPrime.neg();
        }

        if ('correctValues' in this)
        {
            this.correctValues(tableMass, fallingMass);
        }
    }
}


//Base class of the engine
class TaylorEngine extends EngineBase
{
    /**
     * @param {Decimal|number} dt 
     * @param {Decimal|number} cavalieriWeight 
     * @param {string} name The name of the engine
     */
    constructor(dt, cavalieriWeight, name = 'Taylor-Second-Order')
    {
        super(dt, name);

        //Sanitize the cavalieriWeight
        cavalieriWeight = new Decimal(cavalieriWeight);
    }

    /**
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @returns {boolean} true/false for success/error
     */
    executeSingleIteration(tableMass, fallingMass)
    {
        try {
            const acc = this.calculateAccelerations(tableMass, fallingMass);
            tableMass.rDoublePrime = acc.x;
            tableMass.thetaDoublePrime = acc.y;
            fallingMass.heightDoublePrime = acc.z;
            this.applySpeedsAndForces(tableMass, fallingMass);
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }
    
    /**
     * Very important function, moves the system
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    applySpeedsAndForces(tableMass, fallingMass)
    {
        
        //Apply speeds: update position
        this.applySpeed(tableMass, tableMass.acceleration, tableMass.speed, this.dt, this.cavalieriWeight);
        this.applySpeed(fallingMass, fallingMass.acceleration, fallingMass.speed, this.dt, this.cavalieriWeight);

        //Apply accelerations: update speeds
        this.applyAcceleration(fallingMass, fallingMass.acceleration, this.dt);
        this.applyAcceleration(tableMass, tableMass.acceleration, this.dt);
        
        this.cleanData(tableMass, fallingMass);
    }
}


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
        //Step 0
        const yPrime0 = new Vector3(tableMass.rPrime, tableMass.thetaPrime, fallingMass.heightPrime);
        const y0 = new Vector3(tableMass.r, tableMass.theta, fallingMass.height);
        const k1 = this.calculateAccelerations(tableMass, fallingMass);

        //Set the current acceleration of the objects in order to display it
        tableMass.rDoublePrime = k1.x;
        tableMass.thetaDoublePrime = k1.y;
        fallingMass.heightDoublePrime = k1.z;

        /*

        //    Step 1
        // .    .
        // y1 = y0 + k1 * h / 2
        const yPrime1 = yPrime0.plus( k1.times( h.div(2) ) );
        //            .    .
        // y1 = y0 + (y0 + y1) * h / 4
        const y1 = y0.plus( yPrime0.plus(yPrime1).times( h.div(4) ) );
        //            .
        // k2 = f(y1, y1)
        const k2 = this.calculateAccelerationsClone(tableMass, fallingMass, y1, yPrime1);
        
        //    Step 2
        // .    .
        // y2 = y0 + k2 * h / 2
        const yPrime2 = yPrime0.plus( k2.times( h.div(2) ) );
        //            .    .
        // y2 = y0 + (y0 + y2) * h / 4
        const y2 = y0.plus( yPrime0.plus(yPrime2).times( h.div(4) ) );
        //            .
        // k3 = f(y2, y2)
        const k3 = this.calculateAccelerationsClone(tableMass, fallingMass, y2, yPrime2);
        
        //    Step 3
        // .    .
        // y3 = y0 + k3 * h
        const yPrime3 = yPrime0.plus( k3.times( h ) );
        //            .    .
        // y3 = y0 + (y0 + y3) * h / 2
        const y3 = y0.plus( yPrime0.plus(yPrime3).times( h.div(2) ) );
        //            .
        // k4 = f(y3, y3)
        const k4 = this.calculateAccelerationsClone(tableMass, fallingMass, y3, yPrime3);

        //    Retrieve final values
        // .    .
        // y4 = y0 + (k1 + 2 * k2 + 2* k3 + k4) * h / 6
        const yPrime4 = yPrime0.plus( k1.plus( k2.times(2) ).plus( k3.times(2) ).plus( k4 ).times( h.div(6) ) );
        //            .        .        .    .
        // y4 = y0 + (y1 + 2 * y2 + 2 * y3 + y4) * h / 6
        const y4 = y0.plus( yPrime1.plus( yPrime2.times(2) ).plus( yPrime3.times(2) ).plus( yPrime4 ).times( h.div(6) ) );

        */
        // Shorthand for later
        const k1h = k1.times( h );
        //    Step 1
        // .    .
        // y1 = y0 + k1 * h / 2
        const yPrime1 = yPrime0.plus( k1.times( h.div(2) ) );
        //                .        .
        // y1 = y0 + (4 * y0 + 2 * y1 + k1 * h / 2) * h / 12
        const y1 = y0.plus( 
            yPrime0.times(4).plus( yPrime1.times(2) ).plus( k1h.times(0.5) ).times( h.div(12) ) 
        );
        //            .
        // k2 = f(y1, y1)
        const k2 = this.calculateAccelerationsClone(tableMass, fallingMass, y1, yPrime1);
        
        //    Step 2
        // .    .
        // y2 = y0 + k2 * h / 2
        const yPrime2 = yPrime0.plus( k2.times( h.div(2) ) );
        //                .        .
        // y2 = y0 + (4 * y0 + 2 * y2 + k1 * h / 2) * h / 12
        const y2 = y0.plus( 
            yPrime0.times(4).plus( yPrime2.times(2) ).plus( k1h.times(0.5) ).times( h.div(12) ) 
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
            yPrime0.times(4).plus( yPrime3.times(2) ).plus( k1h ).times( h.div(6) ) 
        );
        //            .
        // k4 = f(y3, y3)
        const k4 = this.calculateAccelerationsClone(tableMass, fallingMass, y3, yPrime3);

        //    Retrieve final values
        // .    .
        // y4 = y0 + (k1 + 2 * k2 + 2* k3 + k4) * h / 6
        const yPrime4 = yPrime0.plus( k1.plus( k2.times(2) ).plus( k3.times(2) ).plus( k4 ).times( h.div(6) ) );
        //            .        .        .    .
        // y4 = y0 + (y1 + 2 * y2 + 2 * y3 + y4) * h / 6
        const y4 = y0.plus( yPrime1.plus( yPrime2.times(2) ).plus( yPrime3.times(2) ).plus( yPrime4 ).times( h.div(6) ) );


        //Return final values that will be applied to tableMass and fallingMass
        return [y4, yPrime4];
    }

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