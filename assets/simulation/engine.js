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
     * @param {Vector3} speed 
     * @param {number|Decimal} duration 
     */
    #applySpeedFalling(corpse, speed, duration)
    {
        return corpse.position.add(speed.times(duration));
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {PolarVector} speed 
     * @param {number|Decimal} duration 
     */
    #applySpeedRotating(corpse, speed, duration)
    {
        return corpse.position.add(speed.times(duration));
    }

    /**
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} momentum 
     * @param {Decimal|number} duration 
     */
    applySpeed(corpse, speed, duration)
    {
        
        if (corpse instanceof MassFallingObject)
        {
            return this.#applySpeedFalling(corpse, speed, duration);
        }

        if (corpse instanceof MassRotatingObject)
        {
            return this.#applySpeedRotating(corpse, speed, duration);
        }

        throw new Error('corpse was not of a valid type!');
    }

}

class Engine extends EngineBase
{

    /**
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Decimal|number} dt 
     */
    constructor(tableMass, fallingMass, dt)
    {
        super();
        if (!Decimal.isDecimal(dt))
        {
            dt = new Decimal(dt);
        }
        this.dt = dt;
        this.tableMass = tableMass;
        this.fallingMass = fallingMass;
    }

    #inverteTimeFlow()
    {
        this.dt = this.dt.neg();
    }

    /**
     * 
     * @param {number} num Integer
     */
    executeIterations(num)
    {
        const numAbs = Math.abs(num);
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }
        for (let i = 0; i < numAbs; i++)
        {
            this.applySpeedsAndForces();
            this.getNewAccelerations();
        }
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }
        return this;
    }
    
    applySpeedsAndForces()
    {
        //Apply speeds: update position
        this.applySpeed(this.tableMass, this.tableMass.speed, this.dt);
        this.applySpeed(this.fallingMass, this.fallingMass.speed, this.dt);
        this.tableMass.position.reboundAngle();

        //Apply accelerations: update speeds
        this.applyAcceleration(this.fallingMass, this.fallingMass.acceleration, this.dt);
        this.applyAcceleration(this.tableMass, this.tableMass.acceleration, this.dt);
    }
}

class NoFrictionFixedLengthEngine extends Engine
{
    /**
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Decimal|number} cableLength
     * @param {Decimal|number} dt 
     */
    constructor (tableMass, fallingMass, cableLength, dt)
    {
        super(tableMass, fallingMass, dt);
        if (!Decimal.isDecimal(cableLength))
        {
            cableLength = new Decimal(cableLength);
        }
        this.cableLength = cableLength;
    }


    getNewAccelerations()
    {
        //Prevent values from diverging: we set them both to the medium value
        this.tableMass.rPrime = this.fallingMass.heightPrime = ( this.tableMass.rPrime.plus(this.fallingMass.heightPrime) ).div(2);
        
        // ..         .
        //  R = ( m R 0^2 + M g ) / (m + M)
        this.tableMass.rDoublePrime = this.fallingMass.heightDoublePrime = ( 
            ( this.tableMass.mass.times(this.tableMass.r).times(this.tableMass.thetaPrime).times(this.tableMass.thetaPrime) ).plus(
                this.fallingMass.mass.times(g)
            ) ).div( this.tableMass.mass.plus(this.fallingMass.mass) );
        
        if (this.tableMass.r.lessThanOrEqualTo(0))
        {
            //The object just crossed the center of the table
            this.tableMass.position.reboundPositive();
            this.fallingMass.heightPrime = this.tableMass.rPrime = this.fallingMass.heightPrime.neg();
            this.tableMass.thetaDoublePrime = new Decimal(0);
            return;
        }
        // ..       . .
        //  0 = - 2 R 0 / R
        this.tableMass.thetaDoublePrime = new Decimal(-2).times( this.tableMass.rPrime ).times( this.tableMass.thetaPrime ).div( this.tableMass.r );


        //Since cableLength = r + height, r + height - cableLength = error
        const diff = (this.tableMass.r.plus( this.fallingMass.height.abs() ).minus( this.cableLength ) ).div(2);
        this.tableMass.r = this.tableMass.r.minus( diff );
        this.fallingMass.height = this.fallingMass.height.plus( diff );
    }
}

class NoFrictionVariableLengthEngine extends Engine
{
    /**
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Decimal|number} cableStartLength
     * @param {Decimal|number} k 
     * @param {Decimal|number} dt 
     */
    constructor (tableMass, fallingMass, cableStartLength, k, dt)
    {
        super(tableMass, fallingMass, dt);
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


    getNewAccelerations()
    {
        
    }
}