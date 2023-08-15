
//Simple engine, two variables
class PoligonalEngine2 extends PoligonalEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableLength The cable length, in meters
     * @param {Decimal|number} dt The dt intervas, in seconds
     * @param {Decimal|number} cavalieriWeight The weight of the acceleration movement during the numeric integration
     */
    constructor (cableLength, dt, cavalieriWeight)
    {
        super(dt, cavalieriWeight);

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
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAccelerations(tableMass, fallingMass)
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
}

//More sophisticated engine, three variables
class PoligonalEngine3 extends PoligonalEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableStartLength Start length, zero of the spring energy, in meters
     * @param {Decimal|number} k The spring constant of hooke's law, N/m
     * @param {Decimal|number} dt The time interval, in seconds
     * @param {Decimal|number} cavalieriWeight The weight of the acceleration movement during the numeric integration
     */
    constructor (cableStartLength, k, dt, cavalieriWeight)
    {
        super(dt, cavalieriWeight);

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
     * Function that calculates the new accelerations given the current state,
     * Raises exceptions for errors
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     * @returns {Vector3} a vector containing the three new accelerations
     */
    calculateAccelerations(tableMass, fallingMass)
    {
        //Calculate kx just once
        const kx = ( tableMass.r.minus(fallingMass.height).minus(this.cableStartLength) ).times(this.k);

        const acc = new Vector3();
        // ..     .
        //  R = R 0^2 - k x / m
        acc.x = ( tableMass.r.times( tableMass.thetaPrime.pow(2) ) ).minus( kx.div(tableMass.mass) );
        // ..       . .
        //  0 = - 2 R 0 / R
        acc.y = tableMass.rPrime.times(-2).times( tableMass.thetaPrime ).div( tableMass.r );
        // ..
        //  h = - g - k x / M 
        acc.z = g.neg().plus( kx.div(fallingMass.mass) );

        return acc;
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