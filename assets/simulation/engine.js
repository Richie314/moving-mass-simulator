if (!'Decimal' in window) {
    throw Error('Decimal.js not loaded properly');
}
class Vector3
{
    /**
     * 
     * @param {Decimal} x 
     * @param {Decimal} y 
     * @param {Decimal} z 
     */
    constructor(x, y, z)
    {
        if (!Decimal.IsDecimal(x))
        {
            x = new Decimal(x);
        }
        if (!Decimal.IsDecimal(y))
        {
            y = new Decimal(y);
        }
        if (!Decimal.IsDecimal(z))
        {
            z = new Decimal(z);
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * 
     * @param {Vector3} vec 
     */
    add(vec)
    {
        this.x = this.x.plus(vec.x);
        this.y = this.y.plus(vec.y);
        this.z = this.z.plus(vec.z);
        return this;
    }
    /**
     * 
     * @param {Vector3} vec 
     */
    sub(vec)
    {
        this.x = this.x.minus(vec.x);
        this.y = this.y.minus(vec.y);
        this.z = this.z.minus(vec.z);
        return this;
    }
    /**
     * 
     * @param {Decimal} scalar
     */
    mult(scalar)
    {
        this.x = this.x.times(scalar);
        this.y = this.y.times(scalar);
        this.z = this.z.times(scalar);
        return this;
    }
    /**
     * 
     */
    module()
    {
        return ( this.x.times(this.x).plus( this.y.times(this.y) ).plus( this.z.times(this.z) ) ).sqrt();
    }
    normalize()
    {
        return this.mult( ( new Decimal(1) ).div( this.module() ) );
    }
}
class PolarVector
{
    constructor(r, theta)
    {

    }
}
class MassObject
{

}
class Engine
{
    constructor()
    {

    }

    applyImpulse(corpse, impulse)
    {

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