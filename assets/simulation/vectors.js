if (!'Decimal' in window) {
    throw Error('Decimal.js not loaded properly');
}

class Vector3
{
    /**
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
     * @param {Decimal|number} scalar
     */
    mult(scalar)
    {
        this.x = this.x.times(scalar);
        this.y = this.y.times(scalar);
        this.z = this.z.times(scalar);
        return this;
    }

    /**
     * @returns {Decimal}
     */
    module()
    {
        return this.squared().sqrt();
    }

    /**
     * @returns {Decimal}
     */
    normalize()
    {
        return this.mult( ( new Decimal(1) ).div( this.module() ) );
    }

    /**
     * @param {Vector3} vector 
     * @returns {Vector3}
     */
    set(vector)
    {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    }

    /**
     * @param {Decimal[]|number[]} arr 
     * @returns {Vector3}
     */
    fromArray(arr)
    {
        return new Vector3(arr[0], arr[1], arr[2]);
    }

    /**
     * @param {Decimal|number} scalar 
     * @returns {Vector3}
     */
    times(scalar)
    {
        const other = new Vector3(this.x, this.y, this.z);
        return other.mult(scalar);
    }

    /**
     * 
     * @returns {Decimal}
     */
    squared()
    {
        return this.x.times(this.x).plus( this.y.times(this.y) ).plus( this.z.times(this.z) );
    }
}

class PolarVector
{
    /**
     * @param {Decimal} r 
     * @param {Decimal} theta 
     */
    constructor(r, theta)
    {
        if (!Decimal.IsDecimal(r))
        {
            r = new Decimal(r);
        }
        if (!Decimal.IsDecimal(theta))
        {
            theta = new Decimal(theta);
        }
        this.r = r;
        this.theta = theta;
    }

    /**
     * @param {PolarVector} vec
     * @returns {PolarVector} 
     */
    add(vec)
    {
        this.r = this.r.plus(vec.r);
        this.theta = this.theta.plus(vec.theta);
        return this;
    }

    /**
     * Scales just the radius
     * @param {Decimal|number} scalar
     * @returns {PolarVector} this
     */
    scale(scalar)
    {
        this.r = this.r.times(scalar);
        return this;
    }

    /**
     * Scales just the radius
     * @param {Decimal|number} scalar
     * @returns {PolarVector} a new vector, with the radius scaled
     */
    scaled(scalar)
    {
        const other = new PolarVector(this.r, this.theta);
        return other.scale(scalar);
    }

    /**
     * Scales just the radius
     * @param {Decimal|number} scalar
     * @returns {PolarVector} 
     */
    times(scalar)
    {
        const other = this.scaled(scalar);
        other.theta = other.theta.times(scalar);
        return other;
    }

    /**
     * @returns {Vector3}
     */
    toVec3()
    {
        return (new Vector3(theta.cos(), theta.sin(), 0)).mult(this.r);
    }
}