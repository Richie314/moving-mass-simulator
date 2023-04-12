'use strict';

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
     * 
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
        return corpse.position.add( halfADeltaTSquare.times(0.29).plus( vDeltaT.times(0.71) ) );
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
        return corpse.position.add( halfADeltaTSquare.times(0.29).plus( vDeltaT.times(0.71) ) );
    }

    /**
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

class Engine extends EngineBase
{

    /**
     * @param {Decimal|number} dt 
     */
    constructor(dt)
    {
        super();
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
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @param {number} num Integer
     * @returns {boolean}
     */
    executeIterations(num, tableMass, fallingMass)
    {
        const numAbs = Math.abs(num);
        let ret = true;
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }
        for (let i = 0; i < numAbs; i++)
        {
            this.applySpeedsAndForces(tableMass, fallingMass);
            ret = this.getNewAccelerations(tableMass, fallingMass);
        }
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }
        return ret;
    }
    
    /**
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    applySpeedsAndForces(tableMass, fallingMass)
    {
        
        //Apply accelerations: update speeds
        this.applyAcceleration(fallingMass, fallingMass.acceleration, this.dt);
        this.applyAcceleration(tableMass, tableMass.acceleration, this.dt);

        //Apply speeds: update position
        this.applySpeed(tableMass, tableMass.acceleration, tableMass.speed, this.dt);
        this.applySpeed(fallingMass, fallingMass.acceleration, fallingMass.speed, this.dt);
        
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
            tableMass.position.reboundPositive();
            tableMass.rPrime = tableMass.rPrime.neg();
            ///////TODO: fix this
            fallingMass.heightPrime = fallingMass.heightPrime.neg();
        }

        this.correctValues(tableMass, fallingMass);
    }
}

class FixedLengthEngine extends Engine
{
    /**
     * @param {Decimal|number} cableLength
     * @param {Decimal|number} dt 
     */
    constructor (cableLength, dt)
    {
        super(dt);
        if (!Decimal.isDecimal(cableLength))
        {
            cableLength = new Decimal(cableLength);
        }
        this.cableLength = cableLength;
    }

    /**
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

class VariableLengthEngine extends Engine
{
    /**
     * @param {Decimal|number} cableStartLength
     * @param {Decimal|number} k 
     * @param {Decimal|number} dt 
     */
    constructor (cableStartLength, k, dt)
    {
        super(dt);
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
    correctValues(tableMass, fallingMass)
    {

    }
    /**
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    getNewAccelerations(tableMass, fallingMass)
    {
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