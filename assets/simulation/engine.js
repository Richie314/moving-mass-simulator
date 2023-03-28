
class MassFallingObject
{
    /**
     * 
     * @param {Decimal} mass 
     * @param {Vector3} position 
     * @param {Vector3} speed 
     * @param {Vector3} acceleration 
     */
    constructor(mass, position, speed, acceleration)
    {
        this.mass = mass;
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }
    
    /**
     * The acceleration multiplied by the mass
     * @returns {Vector3}
     */
    force()
    {
        return this.acceleration.times(this.mass);
    }

    /**
     * The speed multiplied by the mass
     * @returns {Vector3}
     */
    momentum()
    {
        return this.speed.times(this.mass);
    }

    /**
     * 
     * @returns {Decimal} the kinetic energy: 1/2 m v^2
     */
    kinetic()
    {
        return this.speed.squared().times(this.mass).div(2);
    }
}
class MassRotatingObject
{
    /**
     * 
     * @param {Decimal} mass 
     * @param {PolarVector} position 
     * @param {PolarVector} speed 
     * @param {PolarVector} acceleration 
     */
    constructor(mass, position, speed, acceleration)
    {
        this.mass = mass;
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }

}
class Engine
{
    /**
     * 
     * @param {Decimal|number} dt 
     */
    constructor(dt)
    {
        if (!Decimal.IsDecimal(dt))
        {
            dt = new Decimal(dt);
        }
        this.dt = dt;
    }

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
    }

    /**
     * @param {MassRotatingObject} corpse 
     * @param {Vector3} impulse 
     */
    #applyImpulseFalling(corpse, impulse)
    {
        return corpse.speed.add(impulse.times((new Decimal(1)).div(corpse.mass)));
    }

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

    /**
     * @param {MassFallingObject|MassRotatingObject} corpse 
     * @param {Vector3|PolarVector} momentum 
     * @param {Decimal|number} duration 
     */
    applyMomentum(corpse, momentum, duration)
    {
        return this.applySpeed( corpse, momentum.times( (new Decimal(1)).div(corpse.mass) ), duration );
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
            this.executeSingleIteration();
        }
        if (num !== numAbs)
        {
            this.#inverteTimeFlow();
        }
        return this;
    }
}

class NoFrictionFixedLengthEngine extends Engine
{
    /**
     * 
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @param {Decimal|number} dt 
     */
    constructor (tableMass, fallingMass, dt)
    {
        super(dt);
        this.tableMass = tableMass;
        this.fallingMass = fallingMass;
    }

    executeSingleIteration()
    {

        //Apply speeds: update position
        //this.applySpeed(this.tableMass, this.tableMass.speed, this.dt);
        this.applySpeed(this.fallingMass, this.fallingMass.speed, this.dt);

        //Apply force: update speeds
        //this.applyForce(this.tableMass, this.tableMass.force(), this.dt);
        this.applyForce(this.fallingMass, this.fallingMass.force(), this.dt);
    }
}
class FrictionFixedLengthEngine extends Engine
{
    
}
class FrictionVariableLengthEngine extends Engine
{
    
}