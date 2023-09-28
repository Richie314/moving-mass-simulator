
//Base class of the engine
class EulerEngine extends EngineBase
{
    /**
     * @param {Decimal|number} dt 
     * @param {string} name The name of the engine
     */
    constructor(dt, name = 'Euler-Partitioned')
    {
        super(dt, name);
    }

    /**
     * @param {MassRotatingObject} tableMass
     * @param {MassFallingObject} fallingMass
     * @returns {boolean} true/false for success/error
     */
    executeSingleIteration(tableMass, fallingMass)
    {
        try {
            
            //                  .
            // Calculate f(y_n, y_n) but not use it yet
            this.calculate_and_set_acc(tableMass, fallingMass);

            //                .
            //y_n+1 = y_n + h y_n

            //.       .       ..
            //y_n+1 = y_n + h y_n
            
            //                          .
            // Calculate y_n+1 and then y_n+1
            this.applySpeedsAndForces(tableMass, fallingMass);
        } catch (err) {
            warn(err);
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
        this.applySpeed(tableMass, tableMass.acceleration, tableMass.speed, this.dt, 0);
        this.applySpeed(fallingMass, fallingMass.acceleration, fallingMass.speed, this.dt, 0);

        //Apply accelerations: update speeds
        this.applyAcceleration(fallingMass, fallingMass.acceleration, this.dt);
        this.applyAcceleration(tableMass, tableMass.acceleration, this.dt);
        
        this.cleanData(tableMass, fallingMass);
    }
}

//Simple engine, two variables
class EulerEngine2 extends EulerEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableLength The cable length, in meters
     * @param {Decimal|number} dt The dt intervas, in seconds
     */
    constructor (cableLength, dt)
    {
        super(dt, 'Euler - 2 varibles');

        //Sanitize the input
        if (!Decimal.isDecimal(cableLength))
        {
            cableLength = new Decimal(cableLength);
        }
        this.cableLength = cableLength;
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
class EulerEngine3 extends EulerEngine
{
    /**
     * Builder
     * @param {Decimal|number} cableStartLength Start length, zero of the spring energy, in meters
     * @param {Decimal|number} k The spring constant of hooke's law, N/m
     * @param {Decimal|number} dt The time interval, in seconds
     */
    constructor (cableStartLength, k, dt)
    {
        super(dt, 'Euler - 3 variables');

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