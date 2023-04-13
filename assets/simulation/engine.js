'use strict';

//Wrapper for static physics functions
class EngineBase
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
     */
    #applySpeedFalling(corpse, acc, speed, duration)
    {
        const vDeltaT = speed.times(duration);
        const halfADeltaTSquare = acc.times(0.5).times(duration.pow(2)).plus(vDeltaT);
        return corpse.position.add( halfADeltaTSquare.times(0.25).plus( vDeltaT.times(0.75) ) );
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {PolarVector} acc
     * @param {PolarVector} speed 
     * @param {number|Decimal} duration 
     */
    #applySpeedRotating(corpse, acc, speed, duration)
    {
        const vDeltaT = speed.times(duration);
        const halfADeltaTSquare = acc.times(0.5).times(duration.pow(2)).plus(vDeltaT);
        return corpse.position.add( halfADeltaTSquare.times(0.25).plus( vDeltaT.times(0.75) ) );
    }

    /**
     * Function of numeric integration for the speeds
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} acc
     * @param {Vector3|PolarVector} speed
     * @param {Decimal|number} duration 
     */
    applySpeed(corpse, acc, speed, duration)
    {
        
        if (corpse instanceof MassFallingObject)
        {
            return this.#applySpeedFalling(corpse, acc, speed, duration);
        }

        if (corpse instanceof MassRotatingObject)
        {
            return this.#applySpeedRotating(corpse, acc, speed, duration);
        }

        throw new Error('corpse was not of a valid type!');
    }

}

//Base class of the engine
class Engine extends EngineBase
{

    /**
     * @param {Decimal|number} dt 
     */
    constructor(dt)
    {
        super();

        //Sanitize the dt
        if (!Decimal.isDecimal(dt))
        {
            dt = new Decimal(dt);
        }
        this.dt = dt;
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
            this.applySpeedsAndForces(tableMass, fallingMass);
            ret = this.getNewAccelerations(tableMass, fallingMass);
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
     * Very important function, moves the system
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    applySpeedsAndForces(tableMass, fallingMass)
    {
        
        //Apply speeds: update position
        this.applySpeed(tableMass, tableMass.acceleration, tableMass.speed, this.dt);
        this.applySpeed(fallingMass, fallingMass.acceleration, fallingMass.speed, this.dt);

        //Apply accelerations: update speeds
        this.applyAcceleration(fallingMass, fallingMass.acceleration, this.dt);
        this.applyAcceleration(tableMass, tableMass.acceleration, this.dt);
        
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

//Simple engine
class FixedLengthEngine extends Engine
{
    /**
     * Builder
     * @param {Decimal|number} cableLength The cable length, in meters
     * @param {Decimal|number} dt The dt intervas, in seconds
     */
    constructor (cableLength, dt)
    {
        super(dt);

        //Sanitize the input
        if (!Decimal.isDecimal(cableLength))
        {
            cableLength = new Decimal(cableLength);
        }
        this.cableLength = cableLength;
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
     * Function that sets the new accelerations given the current state
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    getNewAccelerations(tableMass, fallingMass)
    {

        // ..         .
        //  R = ( m R 0^2 - M g ) / (m + M)
        tableMass.rDoublePrime = fallingMass.heightDoublePrime = ( 
            ( tableMass.mass.times(tableMass.r).times( tableMass.thetaPrime.pow(2) ) ).plus(
                fallingMass.mass.times(g.neg())
            ) ).div( tableMass.mass.plus(fallingMass.mass) );
        if (tableMass.r.isZero())
        {
            return true;
        }
        try {
                    
            // ..       . .
            //  0 = - 2 R 0 / R
            tableMass.thetaDoublePrime = tableMass.rPrime.times(-2).times( tableMass.thetaPrime ).div( tableMass.r );
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }
}

//More sophisticated engine
class VariableLengthEngine extends Engine
{
    /**
     * Builder
     * @param {Decimal|number} cableStartLength Start length, zero of the spring energy, in meters
     * @param {Decimal|number} k The spring constant of hooke's law, N/m
     * @param {Decimal|number} dt The time interval, in seconds
     */
    constructor (cableStartLength, k, dt)
    {
        super(dt);

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
     * Function that sets the new accelerations given the current state,
     * if returns false the simulation should stop
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    getNewAccelerations(tableMass, fallingMass)
    {
        //Calculate kx just once
        const kx = ( tableMass.r.minus(fallingMass.height).minus(this.cableStartLength) ).times(this.k);

        // ..     .
        //  R = R 0^2 - k x / m
        tableMass.rDoublePrime = ( tableMass.r.times( tableMass.thetaPrime.pow(2) ) ).minus( kx.div(tableMass.mass) );
        
        // ..
        //  h = - g - k x / M 
        fallingMass.heightDoublePrime = g.neg().plus( kx.div(fallingMass.mass) );
        if (tableMass.r.isZero())
        {
            return true;
        }
        try {
            // ..       . .
            //  0 = - 2 R 0 / R
            tableMass.thetaDoublePrime = tableMass.rPrime.times(-2).times( tableMass.thetaPrime ).div( tableMass.r );
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
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