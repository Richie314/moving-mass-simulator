
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
    constructor()
    {

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
        return corpse.speed.add(impulse.mult((new Decimal(1)).div(corpse.mass)));
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
        if (!Decimal.IsDecimal(duration))
        {
            duration = new Decimal(duration);
        }
        return this.applyImpulse(corpse, force.mult(duration));
    }

}