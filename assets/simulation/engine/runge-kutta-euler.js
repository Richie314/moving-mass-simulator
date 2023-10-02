//Simple engine, two variables
class EulerEngine2 extends TaylorEngine2
{
    /**
     * Builder
     * @param {Decimal|number} cableLength The cable length, in meters
     * @param {Decimal|number} dt The dt intervas, in seconds
     */
    constructor (cableLength, dt)
    {
        super(cableLength, dt, 0, 'Euler - 2 varibles');
    }
}

//More sophisticated engine, three variables
class EulerEngine3 extends TaylorEngine3
{
    /**
     * Builder
     * @param {Decimal|number} cableStartLength Start length, zero of the spring energy, in meters
     * @param {Decimal|number} k The spring constant of hooke's law, N/m
     * @param {Decimal|number} dt The time interval, in seconds
     */
    constructor (cableStartLength, k, dt)
    {
        super(cableStartLength, k, dt, 0, 'Euler - 3 variables');
    }
}