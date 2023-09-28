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

    
    /**
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAcc2(tableMass, fallingMass)
    {
        const acc = new Vector3();
        // ..   ..         .
        //  R =  h = ( m R 0^2 - M g ) / (m + M)
        acc.x = acc.z = ( ( tableMass.mass.times(tableMass.r).times( tableMass.thetaPrime.pow(2) ) ).plus(
                fallingMass.mass.times(g.neg())
            ) ).div( tableMass.mass.plus(fallingMass.mass) );
        if (tableMass.r.isZero())
            return acc;
        // ..       . .
        //  0 = - 2 R 0 / R
        acc.y = tableMass.rPrime.times(-2).times( tableMass.thetaPrime ).div( tableMass.r );

        return acc;
    }

    /**
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAcc3(tableMass, fallingMass)
    {
        //Calculate kx just once
        const kx = ( tableMass.r.minus(fallingMass.height).minus(this.cableStartLength) ).times(this.k);

        const acc = new Vector3();
        // ..     .
        //  R = R 0^2 - k x / m
        acc.x = ( tableMass.r.times( tableMass.thetaPrime.pow(2) ) ).minus( kx.div(tableMass.mass) );
        // ..
        //  h = - g - k x / M 
        acc.z = g.neg().plus( kx.div(fallingMass.mass) );

        if (tableMass.r.isZero())
            return acc;

        // ..       . .
        //  0 = - 2 R 0 / R
        acc.y = tableMass.rPrime.times(-2).times( tableMass.thetaPrime ).div( tableMass.r );

        return acc;
    }

    calculate_and_set_acc(tableMass, fallingMass)
    {
        const acc = this.calculateAccelerations(tableMass, fallingMass);
        //console.log(acc);
        tableMass.rDoublePrime = acc.x;
        tableMass.thetaDoublePrime = acc.y;
        fallingMass.heightDoublePrime = acc.z;
    }
}

