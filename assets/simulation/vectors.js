'use strict';
if (!('Decimal' in window)) {
    throw Error('Decimal.js not loaded properly');
}
Decimal.set( { precision: 50 } );

class Vector3
{
    /**
     * @param {Decimal} x 
     * @param {Decimal} y 
     * @param {Decimal} z 
     */
    constructor(x = 0, y = 0, z = 0)
    {
        if (!Decimal.isDecimal(x))
        {
            x = new Decimal(x);
        }
        if (!Decimal.isDecimal(y))
        {
            y = new Decimal(y);
        }
        if (!Decimal.isDecimal(z))
        {
            z = new Decimal(z);
        }
        this.x = x;
        this.y = y;
        this.z = z;
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
     * @returns {Vector3}
     */
    plus(vec)
    {
        const other = new Vector3(this.x, this.y, this.z);
        return other.add(vec);
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
     * @param {Vector3} vec 
     * @returns {Vector3}
     */
    minus(vec)
    {
        const other = new Vector3(this.x, this.y, this.z);
        return other.sub(vec);
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
     * @param {Decimal|number} scalar 
     * @returns {Vector3}
     */
    times(scalar)
    {
        const other = new Vector3(this.x, this.y, this.z);
        return other.mult(scalar);
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
     * @returns {Decimal}
     */
    squared()
    {
        return this.scalarProduct(this);
    }

    /**
     * @param {Vector3} vec 
     * @returns {Decimal}
     */
    scalarProduct(vec)
    {
        return this.x.times(vec.x).plus( this.y.times(vec.y) ).plus( this.z.times(vec.z) );
    }

    /**
     * @param {Vector3} vec 
     * @returns {Vector3}
     */
    vectorProduct(vec)
    {
        return new Vector3(
            ( this.y.times(vec.z) ).minus( this.z.times(vec.y) ), 
            ( this.z.times(vec.x) ).minus( this.x.times(vec.z) ), 
            ( this.x.times(vec.y) ).minus( this.y.times(vec.x) ));
    }


    /**
     * @returns {bool}
     */
    isZero()
    {
        return this.x.isZero() && this.y.isZero() && this.z.isZero();
    }

    /**
     * @param {Vector3} vec 
     * @returns {bool}
     */
    equals(vec)
    {
        return vec.minus(this).isZero();
    }

    toPolar()
    {
        if (!this.z.isZero())
        {
            throw new Error('Cant convert from 3d to 2d!');
        }
        const m = this.module();
        if (m.isZero())
            return new PolarVector(m, 0);
        const angle = ( this.x.div(m) ).acos();
        if (this.y.lessThan(0))
        {
            return new PolarVector( m, doublePi.minus(angle) );
        }
        return new PolarVector( m, angle );
    }

    toNumbers()
    {
        return {
            x: this.x.toNumber(),
            y: this.y.toNumber(),
            z: this.z.toNumber()
        };
    }

    /**
     * Creates a copy of this vector
     * @returns {Vector3}
     */
    copy()
    {
        return new Vector3(this.x, this.y, this.z);
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
        if (!Decimal.isDecimal(r))
        {
            r = new Decimal(r);
        }
        if (!Decimal.isDecimal(theta))
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

    reboundPositive()
    {
        if (this.r.isNegative())
        {
            this.r = this.r.neg();
            this.theta = this.theta.plus(pi);
        }
        return this.reboundAngle();
    }

    reboundAngle()
    {
        while (this.theta.isNegative())
        {
            this.theta = this.theta.plus(doublePi);
        }
        while (this.theta.greaterThanOrEqualTo(doublePi))
        {
            this.theta = this.theta.minus(doublePi);
        }
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
        return (new Vector3(this.theta.cos(), this.theta.sin(), 0)).times(this.r);
    }

    /**
     * Set from XY coordinates
     * Setting both x and y to zero results in r of 0 and angle not changed
     * @param {Decimal|number} x 
     * @param {Decimal|number} y 
     */
    setFromXY(x, y)
    {
        if (!Decimal.isDecimal(x))
        {
            x = new Decimal(x);
        }
        if (!Decimal.isDecimal(y))
        {
            y = new Decimal(y);
        }
        this.r = ( x.pow(2).plus( y.pow(y) ) ).sqrt();
        if (this.r.isZero())
        {
            return this;
        }
        //cos0 = x / r
        //sin0 = y / r
        this.theta = Decimal.acos( x.div(this.r) );
        if (y.lessThan(0))
        {
            this.theta = this.theta.neg();
        }
        return this;
    }

    copy()
    {
        return this.scaled(1);
    }
}

const g = new Decimal(9.8067);
const gravity = new Vector3(0, 0, g.neg());
const pi = Decimal.acos(-1);
const doublePi = pi.times(2);
const halfPi = pi.div(2);
const Ten = new Decimal(10);