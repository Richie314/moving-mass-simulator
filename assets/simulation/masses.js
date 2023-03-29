'use strict';

class MassObject
{
    /**
     * 
     * @param {Decimal|number} mass 
     */
    constructor(mass)
    {
        if (!Decimal.isDecimal(mass))
        {
            mass = new Decimal(mass);
        }
        this.mass = mass;
    }
}
class MassFallingObject extends MassObject
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
        super(mass);
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }
    
    /**
     * The acceleration multiplied by the mass
     * @returns {Vector3}
     */
    get force()
    {
        return this.acceleration.times(this.mass);
    }

    /**
     * The speed multiplied by the mass
     * @returns {Vector3}
     */
    get momentum()
    {
        return this.speed.times(this.mass);
    }

    /**
     * Returns the angular moment of the object
     * @param {Vector3|PolarVector|null} center 
     * @returns {Vector3}
     */
    moment(center = null)
    {
        if (center == null)
        {
            return this.position.vectorProduct(this.speed);
        }
        if (center instanceof PolarVector)
        {
            center = center.toVec3();
        }
        return this.position.minus(this.center).vectorProduct(this.speed);
    }

    /**
     * The kinetic energy: 1/2 m v^2
     * @returns {Decimal} 
     */
    get kinetic()
    {
        return this.speed.squared().times(this.mass).div(2);
    }

    get height()
    {
        return this.position.y;
    }

    set height(value)
    {
        return this.position.y = value;
    }

    get gravityPotential()
    {
        return this.mass.times(g).times(this.height);
    }
}
class MassRotatingObject extends MassObject
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
        super(mass);
        this.position = position;
        this.speed = speed;
        this.acceleration = acceleration;
    }

    get kinetic()
    {
        const rOmega = this.r.times(this.thetaPrime);
        return this.mass.div(2).times( this.rPrime.times(this.rPrime).plus( rOmega.times(rOmega) ) );
    }

    //Useful getters and setters

    get r()
    {
        return this.position.r;
    }
    set r(value)
    {
        return this.position.r = value;
    }

    get rPrime()
    {
        return this.speed.r;
    }
    set rPrime(value)
    {
        return this.speed.r = value;
    }

    get rDoublePrime()
    {
        return this.acceleration.r;
    }
    set rDoublePrime(value)
    {
        return this.acceleration.r = value;
    }

    get theta()
    {
        return this.position.theta;
    }
    set theta(value)
    {
        return this.position.theta = value;
    }

    get thetaPrime()
    {
        return this.speed.theta;
    }
    set thetaPrime(value)
    {
        return this.speed.theta = value;
    }

    get thetaDoublePrime()
    {
        return this.acceleration.theta;
    }
    set thetaDoublePrime(value)
    {
        return this.acceleration.theta = value;
    }
}