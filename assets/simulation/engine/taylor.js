//Base class of the engine
class TaylorEngine extends EngineBase
{
    /**
     * @param {Decimal|number} dt 
     * @param {Decimal|number} cavalieriWeight 
     * @param {string} name The name of the engine
     */
    constructor(dt, cavalieriWeight, name = 'Taylor-Second-Order')
    {
        super(dt, name);

        //Sanitize the cavalieriWeight
        cavalieriWeight = new Decimal(cavalieriWeight);
    }

    /**
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @returns {boolean} true/false for success/error
     */
    executeSingleIteration(tableMass, fallingMass)
    {
        try {
            this.calculate_and_set_acc(tableMass, fallingMass);
            this.applySpeedsAndForces(tableMass, fallingMass);
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }
    
    /**
     * Very important function, moves the system
     * @param {MassRotatingObject} tableMass 
     * @param {MassFallingObject} fallingMass 
     */
    applySpeedsAndForces(tableMass, fallingMass)
    {
        
        //Apply speeds: update position
        this.applySpeed(tableMass, tableMass.acceleration, tableMass.speed, this.dt, this.cavalieriWeight);
        this.applySpeed(fallingMass, fallingMass.acceleration, fallingMass.speed, this.dt, this.cavalieriWeight);

        //Apply accelerations: update speeds
        this.applyAcceleration(fallingMass, fallingMass.acceleration, this.dt);
        this.applyAcceleration(tableMass, tableMass.acceleration, this.dt);
        
        this.cleanData(tableMass, fallingMass);
    }
}


//Simple engine, two variables
class TaylorEngine2 extends TaylorEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableLength The cable length, in meters
     * @param {Decimal|number} dt The dt intervas, in seconds
     * @param {Decimal|number} cavalieriWeight The weight of the acceleration movement during the numeric integration
     */
    constructor (cableLength, dt, cavalieriWeight, override_name = 'Taylor - 2 varibles')
    {
        super(dt, cavalieriWeight, override_name);

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
        return this.calculateAcc2(tableMass, fallingMass);
    }
}

//More sophisticated engine, three variables
class TaylorEngine3 extends TaylorEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableStartLength Start length, zero of the spring energy, in meters
     * @param {Decimal|number} k The spring constant of hooke's law, N/m
     * @param {Decimal|number} dt The time interval, in seconds
     * @param {Decimal|number} cavalieriWeight The weight of the acceleration movement during the numeric integration
     */
    constructor (cableStartLength, k, dt, cavalieriWeight, override_name = 'Taylor - 2 varibles')
    {
        super(dt, cavalieriWeight, override_name);

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
        return this.calculateAcc3(tableMass, fallingMass);
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